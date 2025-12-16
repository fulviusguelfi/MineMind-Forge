# MineMind Forge

![Version](https://img.shields.io/badge/version-1.2.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

MineMind Forge is a powerful web-based generator and simulator for Minecraft AI Companion plugins. It utilizes Google's Gemini API to generate production-ready Java code for **Paper/Spigot**, **Fabric**, **Forge**, and **NeoForge** servers.

It allows server operators to create, configure, and simulate intelligent bots that can mine, build, protect, and communicate using natural language.

## Features

*   **Code Generation**: Generates complete Java source code, `pom.xml`, and plugin configurations.
*   **Chat Simulator**: Test your bot's personality and command adherence before deploying code.
*   **Dynamic Configuration**: Adjust Aggressiveness, Learning Rate, and Archetypes via UI.
*   **Secure Auth**: Local SHA-256 Auth, 2FA (TOTP), and placeholder support for Social Login.
*   **Docker Optimized**: High-performance Nginx Alpine container with dynamic environment variable injection.

## 🚀 Getting Started

### Prerequisites

*   **Docker** and **Docker Compose** installed.
*   A **Google Gemini API Key** (Get it from [Google AI Studio](https://aistudio.google.com/)).

### Installation (Docker)

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/minemind-forge.git
    cd minemind-forge
    ```

2.  **Configuration (Environment Variables):**
    You can create a `.env` file or modify `docker-compose.yml`.

    | Variable | Description | Required |
    | :--- | :--- | :--- |
    | `API_KEY` | Your Google Gemini API Key. | **Yes** |
    | `GOOGLE_CLIENT_ID` | OAuth Client ID for Google Login integration. | No |
    | `APPLE_CLIENT_ID` | OAuth Client ID for Apple Login integration. | No |

3.  **Build and Run:**
    ```bash
    docker-compose up --build -d
    ```

4.  **Access the App:**
    Open your browser and navigate to: [http://localhost:8080](http://localhost:8080)

### Installation (Local Node.js)

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Run Development Server:**
    ```bash
    export API_KEY=your_api_key
    npm run dev
    ```

## 📂 Documentation

Detailed documentation on Bot Commands, Archetypes, and usage is available in the `docs/` folder.

*   [**Manual & Command Dictionary**](docs/MANUAL.md): Complete guide to in-game commands and reprogramming.

## 🛠 Tech Stack

*   **Frontend**: React 18, TypeScript, Tailwind CSS
*   **AI**: Google Gemini API (`@google/genai`)
*   **Infrastructure**: Docker, Nginx, Alpine Linux
*   **Auth**: Local + TOTP (Google/Microsoft Authenticator)

## License

This project is open-source and available under the MIT License.