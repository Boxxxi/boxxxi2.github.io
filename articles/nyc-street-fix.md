# NYC StreetFix: An AI-Powered Multimodal 311 Co-Pilot

## Introduction

Every day, New Yorkers encounter broken sidewalks, flooded streets, overflowing trash, malfunctioning traffic signals, and accessibility barriers — yet the friction of filing a 311 complaint is high enough that most issues go unreported. NYC StreetFix is a multimodal AI agent that dramatically lowers that barrier: a user snaps a photo, describes the issue in any of 17 languages (or speaks it aloud), and the system handles everything else — incident classification, agency routing, professional complaint drafting, and submission via SMS, email, or automated phone call.

Built as a team project at NYU (Spring 2026), the system is powered by **Google Gemini 2.5 Flash**, FastAPI, Twilio, SendGrid, and NYC Open Data.

## The Challenge

Filing a 311 complaint manually requires knowing:
1. The correct issue category (out of hundreds)
2. Which agency handles it (DOT, DEP, DSNY, DPR, etc.)
3. How to write a complaint that gets acted on
4. The precise address of the incident

For non-English speakers, elderly users, or anyone in a hurry, this is enough friction to kill the report entirely. The result: cities under-observe their own infrastructure problems.

## System Architecture

NYC StreetFix runs two parallel FastAPI servers — one text-first, one voice-first — sharing a common AI tools layer and state machine.

### API Layer

| Server | Port | Mode | Primary Endpoint |
|--------|------|------|-----------------|
| `api.py` | 8000 | Text-first | `POST /api/chat` |
| `api2.py` | 8001 | Voice-first | `POST /api/voice-chat` |

The text-first server accepts images, audio, text, and optional GPS coordinates. The voice-first server auto-transcribes audio input and returns TTS audio responses on every turn.

### Conversational State Machine

Each user session progresses through a guided pipeline with explicit confirmation checkpoints:

```
New Request (image + text + optional GPS)
    │
    ├── [GPS provided] → Reverse Geocode → Await Address Confirmation
    │                       ├── yes → Process Incident (Auto Pipeline)
    │                       └── no  → Await Address Correction
    │
    ├── [image only]  → Auto Pipeline (immediate)
    │
    └── [text/audio]  → General LLM conversation
                            └──→ Auto Pipeline when issue identified
                                    │
                            Await Details Confirmation
                             ├── yes → Await Submission Mode
                             │          ├── SMS   → Twilio
                             │          ├── Email → SendGrid
                             │          └── Call  → Twilio TwiML
                             └── no  → Await Details Correction
```

## The AI Tools Pipeline

The core intelligence is a 7-step sequential pipeline powered entirely by Gemini:

| Step | Tool | Output |
|------|------|--------|
| 1 | `detect_language` | ISO 639-1 language code (17 languages) |
| 2 | `classify_scene` | Issue type, severity, safety risk, confidence |
| 3 | `extract_incident` | Structured `IncidentReport` with summary |
| 4 | Agency Mapping | DOT / DEP / DSNY / DPR / OEM / NYPD routing |
| 5 | `draft_311_report` | Professional 311 complaint text (bilingual if non-English) |
| 6 | `generate_visual_card` | PNG hazard card with severity badge and location |
| 7 | TTS Audio | MP3 spoken summary for voice responses |

### Classification and Extraction

```python
from google.generativeai import GenerativeModel

async def classify_scene(image_bytes: bytes, text: str) -> ClassificationResult:
    model = GenerativeModel("gemini-2.5-flash")
    
    prompt = CLASSIFICATION_PROMPT.format(text=text)
    response = await model.generate_content_async([
        {"mime_type": "image/jpeg", "data": image_bytes},
        prompt
    ])
    
    return ClassificationResult(
        issue_type=IssueType(response.issue_type),
        severity=SeverityLevel(response.severity),
        safety_risk=SafetyRisk(response.safety_risk),
        confidence=response.confidence
    )

async def extract_incident(image_bytes: bytes, text: str, 
                           location: str) -> IncidentReport:
    model = GenerativeModel("gemini-2.5-flash")
    
    response = await model.generate_content_async([
        {"mime_type": "image/jpeg", "data": image_bytes},
        EXTRACTION_PROMPT.format(text=text, location=location)
    ])
    
    return IncidentReport(
        issue_type=response.issue_type,
        severity=response.severity,
        location=location,
        description=response.description,
        recommended_agency=map_to_agency(response.issue_type),
        summary=response.summary
    )
```

### Agency Routing

NYC has several agencies that handle different infrastructure issues. The taxonomy module maps issue types to the correct agency:

```python
# taxonomy.py
AGENCY_MAP = {
    IssueType.POTHOLE:              "DOT",   # Dept of Transportation
    IssueType.FLOODING:             "DEP",   # Dept of Environmental Protection
    IssueType.ILLEGAL_DUMPING:      "DSNY",  # Dept of Sanitation
    IssueType.BROKEN_SIGNAL:        "DOT",
    IssueType.BROKEN_TREE:          "DPR",   # Dept of Parks and Recreation
    IssueType.ACCESSIBILITY:        "DOT",
    IssueType.EMERGENCY:            "OEM",   # Office of Emergency Management
    IssueType.NOISE:                "NYPD",
}
```

### Visual Hazard Card Generation

For every processed incident, the system generates a shareable PNG card summarizing the issue:

```python
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches

def generate_visual_card(incident: IncidentReport, image_path: str) -> str:
    fig, axes = plt.subplots(1, 2, figsize=(10, 5))
    
    # Left: incident photo
    img = plt.imread(image_path)
    axes[0].imshow(img)
    axes[0].axis('off')
    
    # Right: incident details with severity badge
    severity_colors = {
        SeverityLevel.LOW: "#4CAF50",
        SeverityLevel.MEDIUM: "#FF9800",
        SeverityLevel.HIGH: "#F44336",
        SeverityLevel.CRITICAL: "#9C27B0"
    }
    
    axes[1].set_facecolor("#1a1a2e")
    badge = mpatches.FancyBboxPatch(
        (0.05, 0.75), 0.4, 0.15,
        boxstyle="round,pad=0.02",
        facecolor=severity_colors[incident.severity]
    )
    axes[1].add_patch(badge)
    axes[1].text(0.25, 0.825, incident.severity.value.upper(),
                 ha='center', va='center', color='white', fontweight='bold')
    
    # Agency, location, description...
    output_path = f"cards/{incident.id}.png"
    plt.savefig(output_path, dpi=150, bbox_inches='tight')
    return output_path
```

### Multilingual Support

Incident reports are automatically translated using Gemini for non-English users:

```python
SUPPORTED_LANGUAGES = {
    "es": "Spanish", "zh": "Chinese", "ar": "Arabic",
    "ru": "Russian", "fr": "French", "ht": "Haitian Creole",
    "ko": "Korean", "pl": "Polish", "ur": "Urdu",
    "bn": "Bengali", "it": "Italian", "hi": "Hindi",
    "yi": "Yiddish", "ja": "Japanese", "te": "Telugu",
    "gu": "Gujarati", "pt": "Portuguese"
}
```

## Supporting Data Tools

Beyond the core AI pipeline, the system integrates live city data:

| Tool | Data Source | Purpose |
|------|------------|---------|
| `check_mta_elevators` | MTA NYCT API | Live elevator/escalator outage status |
| `lookup_flood_history` | NYC Open Data (Socrata) | 311 flood history within 500m / 90 days |
| `geocode_location` | Google Maps API | Address text → coordinates |
| `reverse_geocode_location` | Google Maps API | GPS coordinates → street address |

## Submission Options

Once the complaint is confirmed, users choose their submission channel:

```python
# Twilio SMS submission
async def submit_via_sms(phone: str, report: str) -> bool:
    client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
    message = client.messages.create(
        body=f"Your 311 complaint has been drafted:\n\n{report[:1500]}",
        from_=TWILIO_PHONE_NUMBER,
        to=phone
    )
    return message.status == "queued"

# SendGrid email submission
async def submit_via_email(email: str, report: str, 
                           card_path: str) -> bool:
    message = Mail(
        from_email=FROM_EMAIL,
        to_emails=email,
        subject="Your NYC 311 Complaint Report",
        html_content=format_html_email(report)
    )
    message.attachment = build_attachment(card_path)
    sg = SendGridAPIClient(SENDGRID_API_KEY)
    response = sg.send(message)
    return response.status_code == 202
```

## Results and Impact

The system was demonstrated handling real NYC infrastructure scenarios:

- **Pothole detection**: classified from photo with 94% confidence, routed to DOT, 311 complaint drafted in under 3 seconds
- **Flooded intersection**: identified flood history within 500m from NYC Open Data, escalated severity accordingly
- **Elevator outage**: detected via MTA API, accessibility complaint auto-drafted for disabled users
- **Spanish-speaking user**: detected language, produced bilingual complaint with Spanish summary

## Team

This project was built as a team effort:
- Abhishek Bakshi
- Anushri Iyer
- Akhilesh Vangala
- Leo Lorence George

## Conclusion

NYC StreetFix shows how a well-orchestrated LLM pipeline — rather than a single monolithic model — can solve a real urban governance problem. By decomposing the task into specialized tools (classification, extraction, translation, card generation, submission), each step remains auditable and improvable independently. The conversational state machine ensures users stay in control with confirmation checkpoints at each critical decision, while Gemini's multimodal capabilities handle the full range of photo, voice, and text inputs that real-world 311 use cases demand.

## References

1. Google DeepMind. (2024). "Gemini: A Family of Highly Capable Multimodal Models." Technical Report.
2. NYC Open Data Portal. (2026). "311 Service Requests." https://opendata.cityofnewyork.us
3. MTA NYCT API Documentation. (2026). Real-Time Elevator Status.
4. Twilio. (2026). "Programmable Messaging and Voice API Documentation."
5. SendGrid. (2026). "Email API Documentation." Twilio SendGrid.
