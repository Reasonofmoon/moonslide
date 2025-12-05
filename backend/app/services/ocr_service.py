import os
import requests
import time

class OCRService:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.api_url = "https://api.upstage.ai/v1/document-ai/document-parse"

    def parse_pdf(self, file_path: str):
        """
        Sends PDF to Upstage Document Parser API and returns the parsed result.
        """
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found: {file_path}")

        files = {"document": open(file_path, "rb")}
        headers = {"Authorization": f"Bearer {self.api_key}"}
        
        # Using base_model for general layout analysis
        data = {"model": "document-parse"} 

        response = requests.post(self.api_url, headers=headers, files=files, data=data)
        
        if response.status_code != 200:
            raise Exception(f"Upstage API Error: {response.status_code} - {response.text}")

        return response.json()
