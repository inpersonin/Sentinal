# 🛡️ Sentinel — Multilingual Hate Speech Detection

[![Live App](https://img.shields.io/badge/Live_App-GitHub_Pages-FF6A00?style=for-the-badge)](https://inpersonin.github.io/Sentinal/)
[![Backend API](https://img.shields.io/badge/API-Hugging_Face_Space-FF6A00?style=for-the-badge)](https://inpersonin-hate-speech-detection-api.hf.space/docs)
[![Model](https://img.shields.io/badge/Model-XLM--RoBERTa-blue?style=for-the-badge)](https://huggingface.co/inpersonin/xlmr-toxic-classifier)

Sentinel is a premium, high-performance content moderation platform that uses a fine-tuned multilingual Transformer model to detect hate speech in real-time. It features an aggressive, minimal, and futuristic user interface inspired by **McLaren supercars** and **Nothing Tech** design principles.

---

## 🎨 Design Philosophy & Aesthetics

Sentinel is crafted to look like an elite AI startup product. Key design elements include:
*   **AMOLED Black Background** (`#000000`) for absolute contrast.
*   **Neon Burnt-Orange Accents** (`#FF6A00`) resembling McLaren’s iconic Papaya Orange.
*   **Glassmorphic Cards** with heavy backing blurs (`backdrop-filter`) and dynamic orange glow hover effects.
*   **Fluid Micro-Animations** and interactive particle background canvases.
*   **Space Grotesk & Inter** typography for a futuristic, modern UI.

---

## 🚀 Key Features

*   **Multilingual Support**: Trained to moderate and classify text in both **English** and **Hindi**.
*   **Deep Probability Metrics**: Displays fine-grained confidence levels for both toxic and non-toxic classes.
*   **Production Thresholding**: Employs a calibrated **0.64 classification threshold** to prioritize moderation accuracy and reduce false positives.
*   **Zero-Dependency Frontend**: Pure HTML, Vanilla CSS, and modular Vanilla JS for maximum rendering speeds and lightweight deployment.

---

## 🛠️ Tech Stack & Architecture

```
                    ┌─────────────────────────┐
                    │  GitHub Pages Frontend   │
                    │   (HTML/Vanilla JS)     │
                    └────────────┬────────────┘
                                 │
                            (POST /predict)
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │ Hugging Face Spaces API  │
                    │   (FastAPI / Python)    │
                    └────────────┬────────────┘
                                 │
                           (Inference)
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │      XLM-RoBERTa        │
                    │   (Transformer Model)   │
                    └─────────────────────────┘
```

*   **Frontend**: Hosted on [GitHub Pages](https://inpersonin.github.io/Sentinal/), serving static CSS, JS, and HTML.
*   **Backend**: Hosted on [Hugging Face Spaces](https://huggingface.co/spaces/inpersonin/hate-speech-detection-api) using **FastAPI** running inside a CPU-optimized Docker container.
*   **Model**: Fine-tuned [xlmr-toxic-classifier](https://huggingface.co/inpersonin/xlmr-toxic-classifier) tokenized and run using Hugging Face's `transformers` library.

---

## 💻 Local Setup

Since the frontend is built entirely using vanilla web technologies, launching it locally is incredibly fast.

### Prerequisites
*   You don't need Node.js or npm! Simply download the files or clone the repository:
    ```bash
    git clone https://github.com/inpersonin/Sentinal.git
    cd Sentinal
    ```

### Run the App
1. Simply double-click `index.html` to open the application directly in your web browser.
2. Alternatively, if you want to run a local web server (e.g. using Python):
   ```bash
   python -m http.server 8000
   ```
   Then navigate to `http://localhost:8000`.

---

## 📡 API Reference

The frontend connects directly to the following backend endpoint:

### Analyze Text
*   **Endpoint**: `POST https://inpersonin-hate-speech-detection-api.hf.space/predict`
*   **Headers**: `Content-Type: application/json`
*   **Request Body**:
    ```json
    {
      "text": "Your query text here"
    }
    ```
*   **Response Body**:
    ```json
    {
      "prediction": "Toxic",
      "confidence": 97.82,
      "probabilities": {
        "toxic": 97.82,
        "non_toxic": 2.18
      }
    }
    ```

---

## 🔒 License

Distributed under the MIT License. See `LICENSE` for more information.
