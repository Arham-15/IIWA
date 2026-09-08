import pytest
from unittest.mock import MagicMock
from fastapi.testclient import TestClient
import main
from main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

def test_manual_safe_zone():
    # 50 total, 45 attended -> 90%, max_bunks = floor(45 / 0.75) - 50 = 60 - 50 = 10
    response = client.post("/calculate-manual", json={"total": 50, "attended": 45, "remaining": None})
    assert response.status_code == 200
    data = response.json()
    assert data["current_percentage"] == 90.0
    assert data["target_percentage"] == 75.0
    assert data["max_bunks"] == 10
    assert data["classes_needed"] is None
    assert "room to miss 10 more" in data["message"]

def test_manual_shortfall_zone():
    # 50 total, 30 attended -> 60%
    # (30 + n) / (50 + n) >= 0.75 -> 30 + n >= 37.5 + 0.75n -> 0.25n >= 7.5 -> n = 30
    response = client.post("/calculate-manual", json={"total": 50, "attended": 30, "remaining": None})
    assert response.status_code == 200
    data = response.json()
    assert data["current_percentage"] == 60.0
    assert data["max_bunks"] == 0
    assert data["classes_needed"] == 30
    assert "below the 75% target" in data["message"]

def test_manual_with_remaining_on_track():
    # 50 total, 45 attended, 20 remaining
    # x = 45 + 20 - 0.75 * 70 = 65 - 52.5 = 12.5 -> floor = 12
    response = client.post("/calculate-manual", json={"total": 50, "attended": 45, "remaining": 20})
    assert response.status_code == 200
    data = response.json()
    assert data["max_bunks"] == 12
    assert "skip up to 12" in data["message"]

def test_manual_with_remaining_shortfall():
    # 50 total, 20 attended, 20 remaining
    # x = 20 + 20 - 0.75 * 70 = 40 - 52.5 = -12.5 < 0
    response = client.post("/calculate-manual", json={"total": 50, "attended": 20, "remaining": 20})
    assert response.status_code == 200
    data = response.json()
    assert data["max_bunks"] == 0
    assert data["classes_needed"] == 0
    assert "Even attending all 20 remaining classes" in data["message"]

def test_manual_validation_errors():
    # total == 0
    res1 = client.post("/calculate-manual", json={"total": 0, "attended": 0, "remaining": None})
    assert res1.status_code == 422
    assert "Total classes held can't be zero" in res1.json()["detail"]

    # attended > total
    res2 = client.post("/calculate-manual", json={"total": 20, "attended": 25, "remaining": None})
    assert res2.status_code == 422
    assert "Attended classes can't be more than total classes held" in res2.json()["detail"]

def test_ai_missing_api_key_error():
    # When GROQ_API_KEY is not configured
    import os
    original_client = main.groq_client
    original_key = os.environ.get("GROQ_API_KEY")
    main.groq_client = None
    if "GROQ_API_KEY" in os.environ:
        del os.environ["GROQ_API_KEY"]
    try:
        file_content = b"fake-data-not-image"
        files = {"file": ("test.png", file_content, "image/png")}
        response = client.post("/calculate-ai", files=files)
        assert response.status_code == 500
        assert "Server is missing GROQ_API_KEY" in response.json()["detail"]
    finally:
        main.groq_client = original_client
        if original_key is not None:
            os.environ["GROQ_API_KEY"] = original_key

def test_ai_invalid_file_type():
    # Mock groq_client so we get to file type validation
    original_client = main.groq_client
    main.groq_client = MagicMock()
    try:
        file_content = b"fake-data-not-image"
        files = {"file": ("test.txt", file_content, "text/plain")}
        response = client.post("/calculate-ai", files=files)
        assert response.status_code == 422
        assert "Please upload a JPEG, PNG, or WEBP screenshot" in response.json()["detail"]
    finally:
        main.groq_client = original_client

def test_ai_ocr_parsing_flow():
    # Mock groq response returning JSON
    original_client = main.groq_client
    mock_groq = MagicMock()
    mock_choice = MagicMock()
    mock_choice.message.content = '{"total_classes": 60, "attended_classes": 50}'
    mock_completion = MagicMock(choices=[mock_choice])
    mock_groq.chat.completions.create.return_value = mock_completion
    main.groq_client = mock_groq

    try:
        fake_png = b"\x89PNG\r\n\x1a\n" + b"\x00" * 100
        files = {"file": ("screenshot.png", fake_png, "image/png")}
        response = client.post("/calculate-ai", files=files)
        assert response.status_code == 200
        data = response.json()
        assert data["current_percentage"] == round((50/60)*100, 2)
        assert data["target_percentage"] == 75.0
        assert data["max_bunks"] == 6
    finally:
        main.groq_client = original_client

def test_ai_unclear_screenshot_ocr_failure():
    # Mock groq response returning invalid / unparseable JSON
    original_client = main.groq_client
    mock_groq = MagicMock()
    mock_choice = MagicMock()
    mock_choice.message.content = 'I cannot read the text clearly from this blurry screenshot.'
    mock_completion = MagicMock(choices=[mock_choice])
    mock_groq.chat.completions.create.return_value = mock_completion
    main.groq_client = mock_groq

    try:
        fake_png = b"\x89PNG\r\n\x1a\n" + b"\x00" * 100
        files = {"file": ("blurry.png", fake_png, "image/png")}
        response = client.post("/calculate-ai", files=files)
        assert response.status_code == 422
        assert "Could not read the attendance data clearly from that screenshot" in response.json()["detail"]
    finally:
        main.groq_client = original_client
