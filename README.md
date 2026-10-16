# SoundShape — Music Becomes a World

**An Interactive 3D Music Editing Platform Powered by Gemini 4 Argon**

SoundShape transforms music into interactive 3D environments where users can explore musical structures and edit audio by manipulating objects in virtual space.

## Project Background

Traditional music editing tools rely on waveform- and track-based interfaces, which can be difficult for users without music production experience. Meanwhile, most music visualization tools allow users to see music but offer limited ways to interact with or modify it.

SoundShape introduces a spatial approach to music editing by turning musical structures into explorable 3D environments.

## Project Overview

When users upload an MP3 or WAV file, SoundShape analyzes its energy, frequency characteristics, and rhythmic patterns. Gemini 4 Argon interprets these musical features to design a 3D world with corresponding landscapes and musical sculptures.

Users explore the music through a **World → Section → Element** navigation system. They can select specific moments and adjust properties such as volume, bass, treble, and timbre. Multiple audio effects can also be applied to the same time range.

These changes are applied to the actual audio signal, allowing users to compare the original and edited versions through the Before/After feature.

## System Architecture

![SoundShape Architecture](./SoundShape%20Architecture.png)

SoundShape consists of five main processing stages:

1. **Audio Input:** Users upload MP3 or WAV files or select sample tracks.
2. **Audio Analysis:** Web Audio API extracts measurable acoustic features, including energy, frequency characteristics, and rhythmic activity.
3. **AI World Planning:** Gemini 4 Argon generates a structured world blueprint describing musical sections, landscapes, and editable objects.
4. **3D World & Interaction:** Three.js renders the procedural world and provides spatial navigation and musical editing controls.
5. **Audio Editing & Output:** The DSP engine applies supported edits to the uploaded audio signal and enables Before/After comparison.

## Gemini 4 Argon Integration

Gemini 4 Argon is used to plan structured 3D music worlds based on musical timing and measured acoustic features. The generated world blueprint defines musical sections, landscape configurations, and editable objects connected to audio properties.

### Automated World Verification

SoundShape includes a deterministic verification system that checks scene consistency before rendering.

The verification process evaluates six areas:

- **Duration Fidelity:** Ensures the generated world matches the uploaded audio duration.
- **Timeline Continuity:** Checks for gaps and overlaps between musical sections.
- **Editable Sculpture Integrity:** Verifies that required musical controls exist.
- **Rhythm Synchronization:** Checks chronological event placement.
- **Landscape Archetype Differentiation:** Validates the configured landscape diversity rule.
- **DSP Parameter Safety:** Ensures audio editing values remain within supported ranges.

The system supports local deterministic corrections and a separate Gemini API-based repair path. Verification results are calculated from actual validation checks rather than fixed success indicators.

### Verification Results

The verification suite passed **7 out of 7 automated tests**, including tests for invalid song durations, overlapping sections, missing sculptures, repair logic, fallback behavior, and a regression case preventing invalid landscape validation from being marked as passed.

These tests verify the implemented validation and repair logic. Successful live Gemini API repair calls must be confirmed separately from local deterministic corrections and automated verification tests.
