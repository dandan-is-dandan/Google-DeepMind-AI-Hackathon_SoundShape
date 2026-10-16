import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import { WorldSceneSchema, WorldScene } from './src/types/world';
import { verifyWorldScene, repairWorldScene } from './src/audio/worldVerifier';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '15mb' }));

// Define schema for Gemini structured JSON response
const sceneResponseSchema = {
  type: Type.OBJECT,
  properties: {
    duration: { type: Type.NUMBER },
    worldTheme: {
      type: Type.STRING,
      enum: [
        'dreamy_ocean',
        'crystal_canyon',
        'cyber_city',
        'emotional_lake',
        'floating_islands',
        'deep_abyss',
        'fractured_realm',
        'organic_forest',
      ],
    },
    spatialArrangement: {
      type: Type.STRING,
      enum: [
        'linear_archipelago',
        'crescent_bay',
        'orbital_cluster',
        'fractured_spire',
      ],
    },
    overallMood: { type: Type.STRING },
    globalPalette: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    terrainRoughness: { type: Type.NUMBER },
    lightingAtmosphere: { type: Type.STRING },
    creativeRationale: { type: Type.STRING },
    sections: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          start: { type: Type.NUMBER },
          end: { type: Type.NUMBER },
          label: { type: Type.STRING },
          energy: { type: Type.NUMBER },
          mood: { type: Type.STRING },
          landscapeType: {
            type: Type.STRING,
            enum: [
              'glass_island',
              'rising_crystals',
              'crystal_peak',
              'cyber_grid',
              'floating_plateau',
              'neon_spires',
              'abyss_trench',
            ],
          },
          dominantColor: { type: Type.STRING },
          accentColor: { type: Type.STRING },
          objects: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                type: {
                  type: Type.STRING,
                  enum: [
                    'rhythm_towers',
                    'bass_river',
                    'energy_core',
                    'melody_ribbon',
                    'atmosphere_particles',
                    'silence_gap',
                  ],
                },
                editable: { type: Type.BOOLEAN },
                name: { type: Type.STRING },
                description: { type: Type.STRING },
                bassIntensity: { type: Type.NUMBER },
                energyLevel: { type: Type.NUMBER },
                color: { type: Type.STRING },
                rhythmSteps: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      index: { type: Type.INTEGER },
                      timeRatio: { type: Type.NUMBER },
                      intensity: { type: Type.NUMBER },
                      active: { type: Type.BOOLEAN },
                      type: {
                        type: Type.STRING,
                        enum: ['kick', 'snare', 'hihat'],
                      },
                    },
                    required: ['index', 'timeRatio', 'intensity', 'active', 'type'],
                  },
                },
              },
              required: ['id', 'type', 'editable', 'name', 'description'],
            },
          },
        },
        required: [
          'id',
          'start',
          'end',
          'label',
          'energy',
          'mood',
          'landscapeType',
          'dominantColor',
          'accentColor',
          'objects',
        ],
      },
    },
  },
  required: [
    'duration',
    'worldTheme',
    'overallMood',
    'globalPalette',
    'terrainRoughness',
    'lightingAtmosphere',
    'sections',
    'creativeRationale',
  ],
};

// Health Check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    argonModel: 'gemini-4-argon',
    fallbackModel: 'gemini-3.8-flash',
  });
});

/**
 * Generate Musical World Scene via Google Gemini
 */
app.post('/api/analyze-world', async (req: Request, res: Response) => {
  const { audioFeatures, filename } = req.body;

  if (!audioFeatures || !audioFeatures.duration || !audioFeatures.detectedSections) {
    return res.status(400).json({
      success: false,
      error: 'Invalid audio features provided. Duration and sections are required.',
    });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({
      success: false,
      error: 'GEMINI_API_KEY is not set on the server environment. Please use Local Analysis Mode.',
      status: 'gemini_failed',
    });
  }

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  const prompt = `
You are the creative technologist engine for "SoundShape: Music Becomes a World".
Transform the following real measured audio features from the music clip "${filename || 'User Audio'}" into an explorable 3D virtual world scene specification.

MEASURED AUDIO FEATURES:
- Total Duration: ${audioFeatures.duration} seconds
- Estimated Tempo: ${audioFeatures.tempoEstimate} BPM
- Average RMS Energy: ${audioFeatures.averageRms}
- Peak Energy: ${audioFeatures.peakRms}
- Musical Sections:
${audioFeatures.detectedSections
  .map(
    (sec: { start: number; end: number; label: string; energy: number; lowRatio: number; midRatio: number; highRatio: number }, idx: number) =>
      `  Section ${idx + 1}: [${sec.start}s - ${sec.end}s], Label: "${sec.label}", Energy: ${sec.energy}, Low/Bass: ${sec.lowRatio}, Mid: ${sec.midRatio}, Treble/High: ${sec.highRatio}`
  )
  .join('\n')}

REQUIREMENTS:
1. Select the most fitting worldTheme from: ["dreamy_ocean", "crystal_canyon", "cyber_city", "emotional_lake", "floating_islands", "deep_abyss", "fractured_realm", "organic_forest"].
2. Select the most fitting spatialArrangement from:
   - "linear_archipelago" (gentle undulating left-to-right progression)
   - "crescent_bay" (panoramic sweeping horseshoe arc)
   - "orbital_cluster" (concentric orbiting islands at varied elevations)
   - "fractured_spire" (dramatic vertical stair-step ascent for intense energy)
3. Provide a poetic overallMood describing the auditory-to-spatial transformation.
4. Provide a globalPalette of 3 to 4 hexadecimal colors (e.g. ["#62D5E8", "#A58BFA", "#FFB66E", "#0B1020"]).
5. For each section, configure:
   - id: "section_1", "section_2", etc.
   - start and end timestamps matching the audio analysis exactly.
   - label: concise descriptive name.
   - energy: float 0 to 1 based on section energy.
   - mood: specific atmosphere for this section.
   - landscapeType: Assign contrasting landscape archetypes across sections to reflect their musical narrative:
     * "glass_island": For calm, dreamy, or low-energy sections (Glass Sanctuary archetype: smooth curved translucent atoll, suspended polyhedra, serene open space).
     * "cyber_grid" or "floating_plateau": For rhythmic, driving sections (Rhythm City archetype: layered ascending terraces, repeating architectural arches, colonnades).
     * "crystal_peak" or "rising_crystals": For intense, dramatic, or high-energy sections (Fractured Peak archetype: jagged mountain peaks, angular quartz geode clusters, floating shards).
   - dominantColor & accentColor: matching theme.
   - objects: Include musical sculptures:
     * "rhythm_towers" (editable: true, configure 8 to 16 rhythmSteps with index, timeRatio (0 to 1), intensity (0 to 1), active (boolean), and type ("kick", "snare", or "hihat")).
     * "bass_river" (editable: true, bassIntensity: float 0 to 1).
     * "energy_core" (editable: true, energyLevel: float 0 to 1).
     * "melody_ribbon" (editable: false).
     * "atmosphere_particles" (editable: false).
6. Provide a creativeRationale explaining why these visual metaphors and spatial layouts were chosen for this music.
`;

  // Try preferred model: gemini-4-argon first
  let modelToUse = 'gemini-4-argon';
  let responseText: string | undefined;

  try {
    const response = await ai.models.generateContent({
      model: modelToUse,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: sceneResponseSchema,
      },
    });
    responseText = response.text;
  } catch (argonErr: unknown) {
    const errorMsg = argonErr instanceof Error ? argonErr.message : String(argonErr);
    console.warn(`[SoundShape] gemini-4-argon request failed (${errorMsg}). Falling back to gemini-3.8-flash...`);

    // Fallback to gemini-3.8-flash
    try {
      modelToUse = 'gemini-3.8-flash';
      const fallbackResponse = await ai.models.generateContent({
        model: modelToUse,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: sceneResponseSchema,
        },
      });
      responseText = fallbackResponse.text;
    } catch (flashErr: unknown) {
      const flashMsg = flashErr instanceof Error ? flashErr.message : String(flashErr);
      console.error('[SoundShape] Both Gemini models failed:', flashMsg);
      return res.status(502).json({
        success: false,
        error: `Gemini API call failed: ${flashMsg}. You can switch to Local Synthesis & World Generation.`,
        status: 'gemini_failed',
      });
    }
  }

  if (!responseText) {
    return res.status(502).json({
      success: false,
      error: 'Empty response received from Gemini.',
      status: 'gemini_failed',
    });
  }

  try {
    let parsedData = JSON.parse(responseText);
    parsedData.duration = audioFeatures.duration;

    // --- STEP 4: GEMINI 4 ARGON VERIFICATION & REPAIR LOOP ---
    const initialVerification = verifyWorldScene(parsedData, audioFeatures);
    let geminiRepairCalled = false;
    let geminiRepairSucceeded = false;

    if (!initialVerification.passed) {
      console.log(`[SoundShape] Scene failed verification with ${initialVerification.diagnostics.length} issues. Invoking ${modelToUse} repair loop...`);
      geminiRepairCalled = true;
      try {
        const repairPrompt = `
You are the creative technologist engine for "SoundShape: Music Becomes a World".
The 3D World Scene you generated had the following acoustic and structural discrepancies:
${initialVerification.diagnostics.map((d) => `- ${d}`).join('\n')}

Original scene JSON:
${JSON.stringify(parsedData)}

TASK: Repair and return the corrected JSON scene. Strict rules:
1. Strictly align duration to ${audioFeatures.duration} seconds.
2. Ensure section boundaries are strictly contiguous with zero gaps: section 1 starts at 0.0s, each subsequent section starts exactly where the previous ends, and the final section ends at ${audioFeatures.duration}s.
3. Ensure each section contains complete tri-layer sculptures:
   - "rhythm_towers" (with 8 to 16 rhythmSteps, monotonic timeRatio, valid drum types).
   - "bass_river" (with bassIntensity 0 to 1).
   - "energy_core" (with energyLevel 0 to 1).
4. Assign contrasting landscapeType archetypes:
   - 'glass_island' for calm/dreamy passages.
   - 'cyber_grid' or 'floating_plateau' for rhythmic/driving passages.
   - 'crystal_peak' or 'rising_crystals' for intense/climax passages.
Return a clean, fully compliant JSON scene.
`;
        const repairResponse = await ai.models.generateContent({
          model: modelToUse,
          contents: repairPrompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: sceneResponseSchema,
          },
        });
        if (repairResponse.text) {
          const repairedParsed = JSON.parse(repairResponse.text);
          repairedParsed.duration = audioFeatures.duration;
          parsedData = repairedParsed;
          geminiRepairSucceeded = true;
          console.log(`[SoundShape] Successfully repaired scene blueprint via ${modelToUse}.`);
        }
      } catch (repairErr: unknown) {
        console.warn('[SoundShape] Gemini repair loop call error, proceeding with deterministic integrity pass:', repairErr);
      }
    }

    // Apply deterministic verification and architectural integrity seal
    const { repairedScene, report } = repairWorldScene(parsedData, audioFeatures, modelToUse);
    report.geminiRepairCalled = geminiRepairCalled;
    report.geminiRepairSucceeded = geminiRepairSucceeded;
    repairedScene.verificationReport = report;

    // Validate using Zod schema
    const validatedScene = WorldSceneSchema.parse(repairedScene);

    return res.json({
      success: true,
      scene: validatedScene,
      modelUsed: modelToUse,
      source: 'gemini',
      status: 'gemini_complete',
      verificationReport: report,
    });
  } catch (valErr: unknown) {
    const valMsg = valErr instanceof Error ? valErr.message : String(valErr);
    console.error('[SoundShape] Schema validation error:', valMsg);
    return res.status(502).json({
      success: false,
      error: `Scene validation error: ${valMsg}`,
      status: 'gemini_failed',
    });
  }
});

/**
 * On-Demand Gemini 4 Argon World Verification & Repair Endpoint
 */
app.post('/api/verify-and-repair', async (req: Request, res: Response) => {
  const { scene, audioFeatures } = req.body;

  if (!scene) {
    return res.status(400).json({
      success: false,
      error: 'Scene object is required for verification.',
    });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  let modelToUse = 'gemini-4-argon';
  let candidateScene = scene;
  let geminiRepairCalled = false;
  let geminiRepairSucceeded = false;

  // Run initial diagnostic checks
  const verification = verifyWorldScene(scene, audioFeatures);

  if (!verification.passed && apiKey) {
    geminiRepairCalled = true;
    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const repairPrompt = `
You are the creative technologist engine for SoundShape.
The following 3D world scene failed architectural verification checks:
${verification.diagnostics.map((d) => `- ${d}`).join('\n')}

Scene JSON:
${JSON.stringify(scene)}

Please repair the JSON scene satisfying all architectural constraints:
- Contiguous section boundaries matching audio duration (${audioFeatures?.duration || scene.duration}s).
- Complete tri-layer sculptures (rhythm_towers with at least 8 rhythmSteps, bass_river, energy_core) in every section.
- Differentiated landscape archetypes matching musical energy.
Return the clean corrected JSON.
`;

      const rep = await ai.models.generateContent({
        model: modelToUse,
        contents: repairPrompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: sceneResponseSchema,
        },
      });

      if (rep.text) {
        candidateScene = JSON.parse(rep.text);
        geminiRepairSucceeded = true;
      }
    } catch (err: unknown) {
      console.warn('[SoundShape] Gemini verify-and-repair call failed, using deterministic integrity engine:', err);
    }
  }

  const { repairedScene, repairsApplied, report } = repairWorldScene(
    candidateScene,
    audioFeatures,
    apiKey ? modelToUse : 'local-audio-engine'
  );

  report.geminiRepairCalled = geminiRepairCalled;
  report.geminiRepairSucceeded = geminiRepairSucceeded;
  repairedScene.verificationReport = report;

  try {
    const validated = WorldSceneSchema.parse(repairedScene);
    return res.json({
      success: true,
      scene: validated,
      verificationReport: report,
      repairsApplied,
      modelUsed: apiKey ? modelToUse : 'local-audio-engine',
    });
  } catch (err: unknown) {
    return res.status(500).json({
      success: false,
      error: `Failed to serialize repaired scene: ${err instanceof Error ? err.message : String(err)}`,
    });
  }
});

/**
 * Local Procedural World Generation Fallback
 * Honestly labeled as local procedural generation (no fake Gemini claims).
 */
app.post('/api/local-world', (req: Request, res: Response) => {
  const { audioFeatures, filename } = req.body;

  if (!audioFeatures || !audioFeatures.duration || !audioFeatures.detectedSections) {
    return res.status(400).json({
      success: false,
      error: 'Invalid audio features provided.',
    });
  }

  const duration = audioFeatures.duration;
  const sections = audioFeatures.detectedSections;

  // Select theme and spatial layout based on frequency balance and tempo
  const avgLow = sections.reduce((sum: number, s: { lowRatio: number }) => sum + s.lowRatio, 0) / sections.length;
  const avgHigh = sections.reduce((sum: number, s: { highRatio: number }) => sum + s.highRatio, 0) / sections.length;
  const tempo = audioFeatures.tempoEstimate;

  let theme: WorldScene['worldTheme'] = 'dreamy_ocean';
  let spatialArrangement: WorldScene['spatialArrangement'] = 'crescent_bay';
  let palette = ['#62D5E8', '#A58BFA', '#38BDF8', '#0B1020'];

  if (avgLow > 0.4 || tempo >= 140) {
    // High-energy cyber/canyon world with dramatic vertical ascension
    theme = tempo >= 145 ? 'cyber_city' : 'crystal_canyon';
    spatialArrangement = tempo >= 145 ? 'fractured_spire' : 'orbital_cluster';
    palette = tempo >= 145
      ? ['#06B6D4', '#EC4899', '#8B5CF6', '#0F172A']
      : ['#FFB66E', '#EF4444', '#A58BFA', '#111A30'];
  } else if (avgHigh > 0.35) {
    theme = 'floating_islands';
    spatialArrangement = 'linear_archipelago';
    palette = ['#38BDF8', '#818CF8', '#F472B6', '#0B1020'];
  }

  const generatedSections = sections.map((sec: { start: number; end: number; label: string; energy: number; lowRatio: number; midRatio: number; highRatio: number }, idx: number) => {
    const stepCount = 8;
    const rhythmSteps = Array.from({ length: stepCount }, (_, sIdx) => {
      const timeRatio = sIdx / stepCount;
      const isKickBeat = sIdx === 0 || sIdx === 4;
      const isSnareBeat = sIdx === 2 || sIdx === 6;
      let type: 'kick' | 'snare' | 'hihat' = 'hihat';
      if (isKickBeat) type = 'kick';
      else if (isSnareBeat) type = 'snare';

      const baseIntensity = type === 'kick' ? 0.85 : type === 'snare' ? 0.75 : 0.5;
      const active = sec.energy > 0.3 || isKickBeat || (sec.energy > 0.5 && isSnareBeat);

      return {
        index: sIdx,
        timeRatio,
        intensity: Math.round(baseIntensity * sec.energy * 100) / 100,
        active,
        type,
      };
    });

    // Assign contrasting landscape archetypes across musical sections
    let landscapeType: WorldScene['sections'][0]['landscapeType'] = 'glass_island';
    if (sec.energy >= 0.62 || idx === sections.length - 1) {
      landscapeType = 'crystal_peak';
    } else if (sec.energy >= 0.4 || idx === 1) {
      landscapeType = 'cyber_grid';
    } else {
      landscapeType = 'glass_island';
    }

    const objects = [
      {
        id: `rhythm_${idx}`,
        type: 'rhythm_towers' as const,
        editable: true,
        name: 'Rhythm Towers',
        description: 'Harmonic percussive crystal structures reflecting beat impulses and syncopation.',
        rhythmSteps,
      },
      {
        id: `bass_${idx}`,
        type: 'bass_river' as const,
        editable: true,
        name: 'Bass River',
        description: 'Flowing sub-bass stream pulsing with low-frequency energy.',
        bassIntensity: Math.min(1, Math.max(0.2, sec.lowRatio * 2)),
      },
      {
        id: `core_${idx}`,
        type: 'energy_core' as const,
        editable: true,
        name: 'Energy Core',
        description: 'Levitating crystalline polyhedral core representing section energy.',
        energyLevel: sec.energy,
      },
      {
        id: `melody_${idx}`,
        type: 'melody_ribbon' as const,
        editable: false,
        name: 'Melody Ribbon',
        description: 'Catmull-Rom harmonic spline tracing melodic contours.',
      },
      {
        id: `particles_${idx}`,
        type: 'atmosphere_particles' as const,
        editable: false,
        name: 'Atmosphere Particles',
        description: 'High-frequency particle motes responding to spectral transients.',
      },
    ];

    return {
      id: `section_${idx + 1}`,
      start: sec.start,
      end: sec.end,
      label: sec.label,
      energy: sec.energy,
      mood: idx === 0 ? 'Introductory luminous glow' : idx === sections.length - 1 ? 'Dynamic climactic resonance' : 'Propulsive rhythmic groove',
      landscapeType,
      dominantColor: palette[idx % palette.length],
      accentColor: palette[(idx + 1) % palette.length],
      objects,
    };
  });

  const localScene: WorldScene = {
    duration,
    worldTheme: theme,
    spatialArrangement,
    overallMood: `Procedural audio interpretation for ${filename || 'track'} based on FFT spectrum`,
    globalPalette: palette,
    terrainRoughness: theme === 'crystal_canyon' ? 0.8 : theme === 'cyber_city' ? 0.3 : 0.45,
    lightingAtmosphere:
      theme === 'cyber_city'
        ? 'Electric cyan and neon magenta lasers cutting through obsidian grid horizon'
        : theme === 'crystal_canyon'
        ? 'Dramatic amber and violet rim lighting piercing jagged crystal fissures'
        : 'Luminous studio twilight with serene cyan and amethyst reflections',
    sections: generatedSections,
    creativeRationale: `Constructed directly from deterministic Web Audio spectral windows: ${Math.round(avgLow * 100)}% bass ratio, ${tempo} BPM tempo, leading to ${theme.replace('_', ' ')} layout with ${spatialArrangement.replace('_', ' ')}.`,
  };

  return res.json({
    success: true,
    scene: localScene,
    modelUsed: 'local-audio-engine',
    source: 'local',
    status: 'local_only',
  });
});

// Setup Vite middleware in dev or static serving in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`[SoundShape] Full-stack server running on port ${PORT}`);
  });
}

startServer();
