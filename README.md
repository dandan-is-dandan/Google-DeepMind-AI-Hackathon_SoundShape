# SoundShape — Music Becomes a World

**An Interactive 3D Music Editing Platform Powered by Gemini 4 Argon**

SoundShape transforms music into interactive 3D environments where users can explore musical structures and edit audio by manipulating objects in virtual space.

## Project Background

Traditional music editing tools rely on waveform- and track-based interfaces, which can be difficult for users without music production experience. Meanwhile, most music visualization tools allow users to see music but offer limited ways to interact with or modify it.

SoundShape introduces a spatial approach to music editing by turning musical structures into explorable 3D environments.

## Project Overview

When users upload an MP3 or WAV file, SoundShape analyzes its energy, frequency characteristics, and rhythmic patterns. Gemini 4 Argon uses these musical features to plan a 3D world with corresponding landscapes and musical sculptures.

Users explore the music through a **World → Section → Element** navigation system. They can select specific moments and adjust properties such as volume, bass, treble, and timbre. Multiple audio effects can also be applied to the same time range.

These changes are applied to the actual audio signal, allowing users to compare the original and edited versions through the Before/After feature.

## System Architecture

![SoundShape Architecture](./SoundShape%20Architecture.png)

SoundShape consists of five main processing stages:

1. **Audio Input:** Users upload MP3 or WAV files or select sample tracks.
2. **Audio Analysis:** Web Audio API extracts measurable acoustic features, including energy, frequency characteristics, and rhythmic activity.
3. **AI World Planning:** Gemini 4 Argon plans a structured world blueprint describing musical sections, landscapes, spatial arrangements, and editable objects.
4. **3D World & Interaction:** Three.js renders the procedural world and provides spatial navigation and musical editing controls.
5. **Audio Editing & Output:** The DSP engine applies supported effects to the uploaded audio signal and enables Before/After comparison.

## Key Features

### 1. Music-to-World Generation

Transforms uploaded music into a procedural 3D environment based on its measured acoustic characteristics and AI-generated scene specifications.

Musical sections are represented as distinct spatial regions with landscapes, landmarks, and interactive sculptures.

### 2. Spatial Music Exploration

Supports three levels of navigation:

- **World View:** Explore the entire song as a connected 3D environment.
- **Section View:** Navigate individual musical passages and their spatial characteristics.
- **Element View:** Select musical objects and inspect their associated timestamps and editing controls.

Musical sections are arranged chronologically to preserve the song's temporal structure.

### 3. Multi-Layer Audio Editing

Users can select a moment or musical section and apply supported audio effects directly to the uploaded recording.

| Layer | Editing Function |
|---|---|
| Energy | Adjust overall loudness |
| Bass | Modify low-frequency EQ |
| Treble | Modify high-frequency EQ |
| Texture | Adjust tonal filtering |
| Pitch | Modify pitch using the available processing method |
| Timing | Adjust playback speed using the available processing method |

Multiple effects can be applied to the same time range. The original audio is preserved for comparison.

Pitch and timing behavior depend on the implemented audio processor and should not be interpreted as isolated instrument editing or independent time stretching unless specifically supported.

### 4. Before/After Audio Comparison

Users can compare the same passage before and after applying edits.

- **Before:** Original, unprocessed audio
- **After:** Audio with enabled edits applied
- **A/B Compare:** Sequential playback of the original and edited passages

The interface displays the selected time range and active editing effects.

### 5. AI World Blueprint

The World Generation Blueprint provides information about the scene-planning process, including:

- Measured audio characteristics
- Musical section boundaries
- Selected world theme and spatial layout
- Musical interpretations and visual metaphors
- Landscape configurations
- Editable sculptures and their musical mappings

The blueprint helps users understand how musical characteristics are translated into spatial representations.

## Gemini 4 Argon Integration

Gemini 4 Argon is used to plan structured 3D music worlds based on musical timing and measured acoustic features.

The world-planning process combines musical structure with spatial design requirements, including section chronology, landscape configurations, sculpture placement, and supported audio editing controls.

Rather than using AI-generated visuals as a passive background, SoundShape connects the generated spatial environment to an interactive audio editing workflow.

### Automated World Verification

SoundShape implements a deterministic verification system that checks scene consistency.

The verification process evaluates six areas:

- **Duration Fidelity:** Checks whether the generated scene duration matches the uploaded audio.
- **Timeline Continuity:** Detects gaps and overlaps between musical sections.
- **Editable Sculpture Integrity:** Verifies that required musical controls are present.
- **Rhythm Synchronization:** Checks the chronological placement of rhythmic events.
- **Landscape Archetype Differentiation:** Evaluates landscape diversity against the configured validation rule.
- **DSP Parameter Safety:** Checks supported ranges for audio editing parameters.

The system supports local deterministic corrections and a separate Gemini API-based repair path.

Verification results are computed from actual individual checks rather than hardcoded success indicators. The interface also distinguishes local corrections from Gemini API repair attempts.

### Verification Results

During development, the automated verification suite reported **7/7 passing tests**.

The tests cover:

- Valid scene specifications
- Audio duration mismatches
- Overlapping musical sections
- Missing editable sculptures
- Automated repair logic
- Fallback behavior
- Regression testing to prevent invalid landscape configurations from being incorrectly marked as verified

These results confirm the reported automated test outcomes for the validation logic. They do not independently establish that every repair was performed through a live Gemini API call.

## Technology Stack

| Category | Technology |
|---|---|
| AI World Planning | Gemini 4 Argon |
| Frontend | React, TypeScript |
| 3D Rendering | Three.js |
| Audio Analysis | Web Audio API |
| Audio Editing | Web Audio API, DSP |
| Scene Verification | TypeScript-based validation and repair logic |
| Backend | Server-side Gemini API integration |
| Deployment Target | Google Cloud Run |

## How SoundShape Works

**1. Upload Music**

Select an MP3 or WAV file, or use an available sample track.

**2. Analyze Musical Features**

The application extracts acoustic characteristics such as energy, frequency distribution, and rhythmic activity.

**3. Generate a 3D World**

Gemini 4 Argon plans a structured music-world blueprint. The application validates the scene specification and renders the world using Three.js.

**4. Explore the World**

Navigate between musical sections and select the time range or object you want to modify.

**5. Reshape the Music**

Choose an audio editing layer, adjust the supported parameters, and apply changes to the original audio signal.

**6. Compare the Result**

Listen to the original and edited versions of the selected musical passage.

## Originality & Impact

SoundShape goes beyond traditional music visualization by **turning the 3D environment itself into a music editing interface**.

Instead of requiring users to work exclusively with waveforms and tracks, it provides a spatial interface for exploring musical structure and experimenting with audio transformations.

The project is designed for users without extensive music production experience and has potential applications in music education, creative experimentation, and interactive media production.

## Project Scope

SoundShape currently focuses on short audio clips and spatial editing of supported audio properties.

The project does not claim to isolate or independently modify individual instruments such as vocals, guitars, or drums in a mixed recording.

Potential future extensions include instrument separation, advanced pitch shifting, independent time stretching, and more detailed music-to-geometry mapping.

---

**Music Becomes a World. And the World Becomes Music.**
