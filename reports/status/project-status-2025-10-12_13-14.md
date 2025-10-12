# 🧠 Agentic Platform — Project Status Report

- 🗓️ Fecha: Sun, Oct 12, 2025  1:14:02 PM
- 📂 Ubicación: /f/Software Developer/Porfolio/AEP_Report/argentic-platform/agentic-platform

---

## 📁 Estructura general
```bash

F:\Software Developer\Porfolio\AEP_Report\argentic-platform\agentic-platform
├── apps
├── jest.config.ts
├── package.json
├── packages
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── project-audit.sh
├── README.md
├── reporter
├── reports
├── scripts
└── turbo.json

directory: 6 file: 7



[2K[1G
```

## 🧩 Dependencias y versiones

**Node:** v20.18.0
**pnpm:** 9.15.9

**ROOT:**
@agents-hub/ui 0.0.1

**API:**
api 0.0.1

**WEB:**
web no-version

## 🗃️ Prisma models detectados
```
 - Agent
 - AgentTrace
 - Workflow
```

## 🧭 Estado de Git

**Rama actual:** main

**Últimos commits:**
```
26961d0 feat: add agent diagnost and fix some configurations files
a4db618 Merge pull request #118 from fmonfasani/codex/diagnose-agentic-platform-integration-issues
d4edaaa Fix diagnostics script execution flow
2d4fede Merge pull request #117 from fmonfasani/codex/replace-chat.completions.create-with-openai.evals.create
bba8128 Merge pull request #114 from fmonfasani/codex/fix-high-priority-bug-for-eval-configuration
```

**Cambios sin commitear:**
```
?? reports/status/
?? scripts/project-status.sh
```

## 🌐 Puertos activos (3000 / 3001)
```
No hay servicios escuchando en 3000/3001.
```

## 🧪 Diagnóstico API + WEB

Ejecutando diagnóstico detallado...

```markdown
# Agent Diagnostics Report

- Timestamp: 2025-10-12T16:14:24.553Z
- API status: offline

## Summary
| Check | Status | Exit code |
| --- | --- | --- |
| API health probe | offline | 1 |
| API test suite | failed | 1 |
| Web test suite | passed | 0 |

### API health probe
- Command: `pnpm exec tsx scripts/api-health-probe.ts`
- Status: offline
- Exit code: 1

#### Error
```
Command failed: pnpm exec tsx scripts/api-health-probe.ts
Health check error for http://localhost:3001/api/dashboard/areas: fetch failed
```

#### Stdout
```
[no output]
```

#### Stderr
```
Health check error for http://localhost:3001/api/dashboard/areas: fetch failed
```

### API test suite
- Command: `pnpm exec jest --config apps/api/jest.config.ts`
- Status: failed
- Exit code: 1

#### Error
```
Command failed: pnpm exec jest --config apps/api/jest.config.ts
[31m[Nest] 18796  - [39m14/11/2023, 7:13:20 p.m. [31m  ERROR[39m [38;5;3m[AgentEvalService] [39m[31m❌ Error evaluando traza trace-1: openai.evals.runs.create is not a function[39m
[31m[Nest] 18796  - [39m14/11/2023, 7:13:20 p.m. [31m  ERROR[39m [38;5;3m[AgentEvalService] [39m[31m❌ Error evaluando traza trace-2: openai.evals.runs.create is not a function[39m
FAIL apps/api/test/agent-eval.e2e-spec.ts (5.707 s)
  ● AgentEvalService › crea la evaluación y persiste grade/feedback/evaluator

    expect(jest.fn()).toHaveBeenCalledWith(...expected)

    Expected: ObjectContaining {"evaluation_template_id": "tmpl_123", "inputs": [ObjectContaining {"input": "Pregunta original", "output": "Respuesta final"}]}
    Received: {"data_source_config": {"include_sample_schema": true, "item_schema": {"properties": {"agent_name": {"type": "string"}, "completion": {"type": "string"}, "prompt": {"type": "string"}, "trace_id": {"type": "string"}}, "required": ["prompt", "completion"], "type": "object"}, "type": "custom"}, "name": "trace-trace-1-1700000000000", "testing_criteria": [{"input": [{"content": "Eres un evaluador imparcial. Analiza la respuesta del asistente y asigna una puntuación entre 0 y 1 para el criterio \"Claridad técnica\". Evalúa si la respuesta explica conceptos técnicos de forma clara y correcta.", "role": "system", "type": "message"}, {"content": "Prompt del usuario:
    {{item.prompt}}·
    Respuesta del asistente:
    {{item.completion}}", "role": "user", "type": "message"}], "model": "gpt-4o-mini", "name": "Claridad técnica", "pass_threshold": 0.7, "range": [0, 1], "type": "score_model"}, {"input": [{"content": "Eres un evaluador imparcial. Analiza la respuesta del asistente y asigna una puntuación entre 0 y 1 para el criterio \"Coherencia institucional\". Verifica que el mensaje respete el tono y lineamientos institucionales del ENACOM.", "role": "system", "type": "message"}, {"content": "Prompt del usuario:
    {{item.prompt}}·
    Respuesta del asistente:
    {{item.completion}}", "role": "user", "type": "message"}], "model": "gpt-4o-mini", "name": "Coherencia institucional", "pass_threshold": 0.7, "range": [0, 1], "type": "score_model"}, {"input": [{"content": "Eres un evaluador imparcial. Analiza la respuesta del asistente y asigna una puntuación entre 0 y 1 para el criterio \"Nivel de detalle\". Analiza si la respuesta ofrece el nivel de profundidad adecuado para el pedido.", "role": "system", "type": "message"}, {"content": "Prompt del usuario:
    {{item.prompt}}·
    Respuesta del asistente:
    {{item.completion}}", "role": "user", "type": "message"}], "model": "gpt-4o-mini", "name": "Nivel de detalle", "pass_threshold": 0.7, "range": [0, 1], "type": "score_model"}, {"input": [{"content": "Eres un evaluador imparcial. Analiza la respuesta del asistente y asigna una puntuación entre 0 y 1 para el criterio \"Precisión en los datos\". Confirma que los datos aportados sean correctos y estén bien fundamentados.", "role": "system", "type": "message"}, {"content": "Prompt del usuario:
    {{item.prompt}}·
    Respuesta del asistente:
    {{item.completion}}", "role": "user", "type": "message"}], "model": "gpt-4o-mini", "name": "Precisión en los datos", "pass_threshold": 0.7, "range": [0, 1], "type": "score_model"}]}

    Number of calls: 1

    [0m [90m 102 |[39m     [36mawait[39m promise
     [90m 103 |[39m
    [31m[1m>[22m[39m[90m 104 |[39m     expect(createMock)[33m.[39mtoHaveBeenCalledWith(
     [90m     |[39m                        [31m[1m^[22m[39m
     [90m 105 |[39m       expect[33m.[39mobjectContaining({
     [90m 106 |[39m         evaluation_template_id[33m:[39m [32m'tmpl_123'[39m[33m,[39m
     [90m 107 |[39m         inputs[33m:[39m [[0m

      at Object.<anonymous> (test/agent-eval.e2e-spec.ts:104:24)

  ● AgentEvalService › utiliza los resultados del grader cuando la respuesta final llega en el run

    expect(jest.fn()).toHaveBeenCalledWith(...expected)

    - Expected
    + Received

      Object {
        "data": Object {
    -     "evaluator": "grader",
    -     "feedback": "Necesita más detalle",
    -     "grade": 0.42,
    +     "evaluator": "auto-eval",
    +     "feedback": "Error al ejecutar la evaluación automática: openai.evals.runs.create is not a function",
        },
        "where": Object {
          "id": "trace-2",
        },
      },

    Number of calls: 1

    [0m [90m 159 |[39m
     [90m 160 |[39m     expect(retrieveMock)[33m.[39mnot[33m.[39mtoHaveBeenCalled()
    [31m[1m>[22m[39m[90m 161 |[39m     expect(prisma[33m.[39magentTrace[33m.[39mupdate)[33m.[39mtoHaveBeenCalledWith({
     [90m     |[39m                                      [31m[1m^[22m[39m
     [90m 162 |[39m       where[33m:[39m { id[33m:[39m [32m'trace-2'[39m }[33m,[39m
     [90m 163 |[39m       data[33m:[39m {
     [90m 164 |[39m         grade[33m:[39m [35m0.42[39m[33m,[39m[0m

      at Object.<anonymous> (test/agent-eval.e2e-spec.ts:161:38)

FAIL apps/api/test/dashboard.e2e-spec.ts (6.966 s)
  ● DashboardController (e2e) › /dashboard/areas (GET) should return grouped metrics with averages

    Nest can't resolve dependencies of the AgentRunController (AgentRunnerService, ?, AgentTraceService, AgentEvalService). Please make sure that the argument AgentUploadService at index [1] is available in the AgentsModule context.

    Potential solutions:
    - Is AgentsModule a valid NestJS module?
    - If AgentUploadService is a provider, is it part of the current AgentsModule?
    - If AgentUploadService is exported from a separate @Module, is that module imported within AgentsModule?
      @Module({
        imports: [ /* the Module containing AgentUploadService */ ]
      })

    [0m [90m 51 |[39m
     [90m 52 |[39m   beforeAll([36masync[39m () [33m=>[39m {
    [31m[1m>[22m[39m[90m 53 |[39m     [36mconst[39m moduleFixture[33m:[39m [33mTestingModule[39m [33m=[39m [36mawait[39m [33mTest[39m[33m.[39mcreateTestingModule({
     [90m    |[39m                                          [31m[1m^[22m[39m
     [90m 54 |[39m       imports[33m:[39m [[33mAppModule[39m][33m,[39m
     [90m 55 |[39m     })
     [90m 56 |[39m       [33m.[39moverrideProvider([33mPrismaService[39m)[0m

      at TestingInjector.lookupComponentInParentModules (../../node_modules/.pnpm/@nestjs+core@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+platfo_ug43xkxzpru5sofuywkvnd3edy/node_modules/@nestjs/core/injector/injector.js:262:19)
      at TestingInjector.resolveComponentInstance (../../node_modules/.pnpm/@nestjs+core@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+platfo_ug43xkxzpru5sofuywkvnd3edy/node_modules/@nestjs/core/injector/injector.js:215:33)
      at TestingInjector.resolveComponentInstance (../../node_modules/.pnpm/@nestjs+testing@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+cor_q2l2dqhjudmmdjwfrxx4tbtwgy/node_modules/@nestjs/testing/testing-injector.js:19:45)
      at resolveParam (../../node_modules/.pnpm/@nestjs+core@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+platfo_ug43xkxzpru5sofuywkvnd3edy/node_modules/@nestjs/core/injector/injector.js:129:38)
          at async Promise.all (index 1)
      at TestingInjector.resolveConstructorParams (../../node_modules/.pnpm/@nestjs+core@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+platfo_ug43xkxzpru5sofuywkvnd3edy/node_modules/@nestjs/core/injector/injector.js:144:27)
      at TestingInjector.loadInstance (../../node_modules/.pnpm/@nestjs+core@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+platfo_ug43xkxzpru5sofuywkvnd3edy/node_modules/@nestjs/core/injector/injector.js:70:13)
      at TestingInjector.loadController (../../node_modules/.pnpm/@nestjs+core@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+platfo_ug43xkxzpru5sofuywkvnd3edy/node_modules/@nestjs/core/injector/injector.js:89:9)
      at ../../node_modules/.pnpm/@nestjs+core@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+platfo_ug43xkxzpru5sofuywkvnd3edy/node_modules/@nestjs/core/injector/instance-loader.js:68:13
          at async Promise.all (index 1)
      at TestingInstanceLoader.createInstancesOfControllers (../../node_modules/.pnpm/@nestjs+core@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+platfo_ug43xkxzpru5sofuywkvnd3edy/node_modules/@nestjs/core/injector/instance-loader.js:67:9)
      at ../../node_modules/.pnpm/@nestjs+core@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+platfo_ug43xkxzpru5sofuywkvnd3edy/node_modules/@nestjs/core/injector/instance-loader.js:42:13
          at async Promise.all (index 3)
      at TestingInstanceLoader.createInstances (../../node_modules/.pnpm/@nestjs+core@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+platfo_ug43xkxzpru5sofuywkvnd3edy/node_modules/@nestjs/core/injector/instance-loader.js:39:9)
      at TestingInstanceLoader.createInstancesOfDependencies (../../node_modules/.pnpm/@nestjs+core@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+platfo_ug43xkxzpru5sofuywkvnd3edy/node_modules/@nestjs/core/injector/instance-loader.js:22:13)
      at TestingInstanceLoader.createInstancesOfDependencies (../../node_modules/.pnpm/@nestjs+testing@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+cor_q2l2dqhjudmmdjwfrxx4tbtwgy/node_modules/@nestjs/testing/testing-instance-loader.js:9:9)
      at TestingModuleBuilder.createInstancesOfDependencies (../../node_modules/.pnpm/@nestjs+testing@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+cor_q2l2dqhjudmmdjwfrxx4tbtwgy/node_modules/@nestjs/testing/testing-module.builder.js:118:9)
      at TestingModuleBuilder.compile (../../node_modules/.pnpm/@nestjs+testing@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+cor_q2l2dqhjudmmdjwfrxx4tbtwgy/node_modules/@nestjs/testing/testing-module.builder.js:74:9)
      at Object.<anonymous> (test/dashboard.e2e-spec.ts:53:42)

  ● DashboardController (e2e) › /dashboard/leaderboard (GET) should include leaderboard and area summaries

    Nest can't resolve dependencies of the AgentRunController (AgentRunnerService, ?, AgentTraceService, AgentEvalService). Please make sure that the argument AgentUploadService at index [1] is available in the AgentsModule context.

    Potential solutions:
    - Is AgentsModule a valid NestJS module?
    - If AgentUploadService is a provider, is it part of the current AgentsModule?
    - If AgentUploadService is exported from a separate @Module, is that module imported within AgentsModule?
      @Module({
        imports: [ /* the Module containing AgentUploadService */ ]
      })

    [0m [90m 51 |[39m
     [90m 52 |[39m   beforeAll([36masync[39m () [33m=>[39m {
    [31m[1m>[22m[39m[90m 53 |[39m     [36mconst[39m moduleFixture[33m:[39m [33mTestingModule[39m [33m=[39m [36mawait[39m [33mTest[39m[33m.[39mcreateTestingModule({
     [90m    |[39m                                          [31m[1m^[22m[39m
     [90m 54 |[39m       imports[33m:[39m [[33mAppModule[39m][33m,[39m
     [90m 55 |[39m     })
     [90m 56 |[39m       [33m.[39moverrideProvider([33mPrismaService[39m)[0m

      at TestingInjector.lookupComponentInParentModules (../../node_modules/.pnpm/@nestjs+core@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+platfo_ug43xkxzpru5sofuywkvnd3edy/node_modules/@nestjs/core/injector/injector.js:262:19)
      at TestingInjector.resolveComponentInstance (../../node_modules/.pnpm/@nestjs+core@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+platfo_ug43xkxzpru5sofuywkvnd3edy/node_modules/@nestjs/core/injector/injector.js:215:33)
      at TestingInjector.resolveComponentInstance (../../node_modules/.pnpm/@nestjs+testing@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+cor_q2l2dqhjudmmdjwfrxx4tbtwgy/node_modules/@nestjs/testing/testing-injector.js:19:45)
      at resolveParam (../../node_modules/.pnpm/@nestjs+core@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+platfo_ug43xkxzpru5sofuywkvnd3edy/node_modules/@nestjs/core/injector/injector.js:129:38)
          at async Promise.all (index 1)
      at TestingInjector.resolveConstructorParams (../../node_modules/.pnpm/@nestjs+core@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+platfo_ug43xkxzpru5sofuywkvnd3edy/node_modules/@nestjs/core/injector/injector.js:144:27)
      at TestingInjector.loadInstance (../../node_modules/.pnpm/@nestjs+core@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+platfo_ug43xkxzpru5sofuywkvnd3edy/node_modules/@nestjs/core/injector/injector.js:70:13)
      at TestingInjector.loadController (../../node_modules/.pnpm/@nestjs+core@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+platfo_ug43xkxzpru5sofuywkvnd3edy/node_modules/@nestjs/core/injector/injector.js:89:9)
      at ../../node_modules/.pnpm/@nestjs+core@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+platfo_ug43xkxzpru5sofuywkvnd3edy/node_modules/@nestjs/core/injector/instance-loader.js:68:13
          at async Promise.all (index 1)
      at TestingInstanceLoader.createInstancesOfControllers (../../node_modules/.pnpm/@nestjs+core@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+platfo_ug43xkxzpru5sofuywkvnd3edy/node_modules/@nestjs/core/injector/instance-loader.js:67:9)
      at ../../node_modules/.pnpm/@nestjs+core@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+platfo_ug43xkxzpru5sofuywkvnd3edy/node_modules/@nestjs/core/injector/instance-loader.js:42:13
          at async Promise.all (index 3)
      at TestingInstanceLoader.createInstances (../../node_modules/.pnpm/@nestjs+core@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+platfo_ug43xkxzpru5sofuywkvnd3edy/node_modules/@nestjs/core/injector/instance-loader.js:39:9)
      at TestingInstanceLoader.createInstancesOfDependencies (../../node_modules/.pnpm/@nestjs+core@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+platfo_ug43xkxzpru5sofuywkvnd3edy/node_modules/@nestjs/core/injector/instance-loader.js:22:13)
      at TestingInstanceLoader.createInstancesOfDependencies (../../node_modules/.pnpm/@nestjs+testing@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+cor_q2l2dqhjudmmdjwfrxx4tbtwgy/node_modules/@nestjs/testing/testing-instance-loader.js:9:9)
      at TestingModuleBuilder.createInstancesOfDependencies (../../node_modules/.pnpm/@nestjs+testing@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+cor_q2l2dqhjudmmdjwfrxx4tbtwgy/node_modules/@nestjs/testing/testing-module.builder.js:118:9)
      at TestingModuleBuilder.compile (../../node_modules/.pnpm/@nestjs+testing@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+cor_q2l2dqhjudmmdjwfrxx4tbtwgy/node_modules/@nestjs/testing/testing-module.builder.js:74:9)
      at Object.<anonymous> (test/dashboard.e2e-spec.ts:53:42)


  ● Test suite failed to run

    TypeError: Cannot read properties of undefined (reading 'close')

    [0m [90m 150 |[39m
     [90m 151 |[39m   afterAll([36masync[39m () [33m=>[39m {
    [31m[1m>[22m[39m[90m 152 |[39m     [36mawait[39m app[33m.[39mclose()
     [90m     |[39m               [31m[1m^[22m[39m
     [90m 153 |[39m   })
     [90m 154 |[39m })
     [90m 155 |[39m[0m

      at Object.<anonymous> (test/dashboard.e2e-spec.ts:152:15)

FAIL apps/api/test/agents.e2e-spec.ts (6.954 s)
  ● AgentRunController (e2e) › POST /agents/:id/run should delegate to AgentRunnerService

    Nest can't resolve dependencies of the AgentRunController (AgentRunnerService, ?, AgentTraceService, AgentEvalService). Please make sure that the argument AgentUploadService at index [1] is available in the AgentsModule context.

    Potential solutions:
    - Is AgentsModule a valid NestJS module?
    - If AgentUploadService is a provider, is it part of the current AgentsModule?
    - If AgentUploadService is exported from a separate @Module, is that module imported within AgentsModule?
      @Module({
        imports: [ /* the Module containing AgentUploadService */ ]
      })

    [0m [90m 29 |[39m
     [90m 30 |[39m   beforeAll([36masync[39m () [33m=>[39m {
    [31m[1m>[22m[39m[90m 31 |[39m     [36mconst[39m moduleFixture[33m:[39m [33mTestingModule[39m [33m=[39m [36mawait[39m [33mTest[39m[33m.[39mcreateTestingModule({
     [90m    |[39m                                          [31m[1m^[22m[39m
     [90m 32 |[39m       imports[33m:[39m [[33mAppModule[39m]
     [90m 33 |[39m     })
     [90m 34 |[39m       [33m.[39moverrideProvider([33mAgentRunnerService[39m)[0m

      at TestingInjector.lookupComponentInParentModules (../../node_modules/.pnpm/@nestjs+core@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+platfo_ug43xkxzpru5sofuywkvnd3edy/node_modules/@nestjs/core/injector/injector.js:262:19)
      at TestingInjector.resolveComponentInstance (../../node_modules/.pnpm/@nestjs+core@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+platfo_ug43xkxzpru5sofuywkvnd3edy/node_modules/@nestjs/core/injector/injector.js:215:33)
      at TestingInjector.resolveComponentInstance (../../node_modules/.pnpm/@nestjs+testing@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+cor_q2l2dqhjudmmdjwfrxx4tbtwgy/node_modules/@nestjs/testing/testing-injector.js:19:45)
      at resolveParam (../../node_modules/.pnpm/@nestjs+core@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+platfo_ug43xkxzpru5sofuywkvnd3edy/node_modules/@nestjs/core/injector/injector.js:129:38)
          at async Promise.all (index 1)
      at TestingInjector.resolveConstructorParams (../../node_modules/.pnpm/@nestjs+core@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+platfo_ug43xkxzpru5sofuywkvnd3edy/node_modules/@nestjs/core/injector/injector.js:144:27)
      at TestingInjector.loadInstance (../../node_modules/.pnpm/@nestjs+core@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+platfo_ug43xkxzpru5sofuywkvnd3edy/node_modules/@nestjs/core/injector/injector.js:70:13)
      at TestingInjector.loadController (../../node_modules/.pnpm/@nestjs+core@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+platfo_ug43xkxzpru5sofuywkvnd3edy/node_modules/@nestjs/core/injector/injector.js:89:9)
      at ../../node_modules/.pnpm/@nestjs+core@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+platfo_ug43xkxzpru5sofuywkvnd3edy/node_modules/@nestjs/core/injector/instance-loader.js:68:13
          at async Promise.all (index 1)
      at TestingInstanceLoader.createInstancesOfControllers (../../node_modules/.pnpm/@nestjs+core@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+platfo_ug43xkxzpru5sofuywkvnd3edy/node_modules/@nestjs/core/injector/instance-loader.js:67:9)
      at ../../node_modules/.pnpm/@nestjs+core@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+platfo_ug43xkxzpru5sofuywkvnd3edy/node_modules/@nestjs/core/injector/instance-loader.js:42:13
          at async Promise.all (index 3)
      at TestingInstanceLoader.createInstances (../../node_modules/.pnpm/@nestjs+core@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+platfo_ug43xkxzpru5sofuywkvnd3edy/node_modules/@nestjs/core/injector/instance-loader.js:39:9)
      at TestingInstanceLoader.createInstancesOfDependencies (../../node_modules/.pnpm/@nestjs+core@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+platfo_ug43xkxzpru5sofuywkvnd3edy/node_modules/@nestjs/core/injector/instance-loader.js:22:13)
      at TestingInstanceLoader.createInstancesOfDependencies (../../node_modules/.pnpm/@nestjs+testing@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+cor_q2l2dqhjudmmdjwfrxx4tbtwgy/node_modules/@nestjs/testing/testing-instance-loader.js:9:9)
      at TestingModuleBuilder.createInstancesOfDependencies (../../node_modules/.pnpm/@nestjs+testing@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+cor_q2l2dqhjudmmdjwfrxx4tbtwgy/node_modules/@nestjs/testing/testing-module.builder.js:118:9)
      at TestingModuleBuilder.compile (../../node_modules/.pnpm/@nestjs+testing@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+cor_q2l2dqhjudmmdjwfrxx4tbtwgy/node_modules/@nestjs/testing/testing-module.builder.js:74:9)
      at Object.<anonymous> (test/agents.e2e-spec.ts:31:42)

  ● AgentRunController (e2e) › GET /agents/:id/traces should return trace summaries from AgentRunnerService

    Nest can't resolve dependencies of the AgentRunController (AgentRunnerService, ?, AgentTraceService, AgentEvalService). Please make sure that the argument AgentUploadService at index [1] is available in the AgentsModule context.

    Potential solutions:
    - Is AgentsModule a valid NestJS module?
    - If AgentUploadService is a provider, is it part of the current AgentsModule?
    - If AgentUploadService is exported from a separate @Module, is that module imported within AgentsModule?
      @Module({
        imports: [ /* the Module containing AgentUploadService */ ]
      })

    [0m [90m 29 |[39m
     [90m 30 |[39m   beforeAll([36masync[39m () [33m=>[39m {
    [31m[1m>[22m[39m[90m 31 |[39m     [36mconst[39m moduleFixture[33m:[39m [33mTestingModule[39m [33m=[39m [36mawait[39m [33mTest[39m[33m.[39mcreateTestingModule({
     [90m    |[39m                                          [31m[1m^[22m[39m
     [90m 32 |[39m       imports[33m:[39m [[33mAppModule[39m]
     [90m 33 |[39m     })
     [90m 34 |[39m       [33m.[39moverrideProvider([33mAgentRunnerService[39m)[0m

      at TestingInjector.lookupComponentInParentModules (../../node_modules/.pnpm/@nestjs+core@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+platfo_ug43xkxzpru5sofuywkvnd3edy/node_modules/@nestjs/core/injector/injector.js:262:19)
      at TestingInjector.resolveComponentInstance (../../node_modules/.pnpm/@nestjs+core@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+platfo_ug43xkxzpru5sofuywkvnd3edy/node_modules/@nestjs/core/injector/injector.js:215:33)
      at TestingInjector.resolveComponentInstance (../../node_modules/.pnpm/@nestjs+testing@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+cor_q2l2dqhjudmmdjwfrxx4tbtwgy/node_modules/@nestjs/testing/testing-injector.js:19:45)
      at resolveParam (../../node_modules/.pnpm/@nestjs+core@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+platfo_ug43xkxzpru5sofuywkvnd3edy/node_modules/@nestjs/core/injector/injector.js:129:38)
          at async Promise.all (index 1)
      at TestingInjector.resolveConstructorParams (../../node_modules/.pnpm/@nestjs+core@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+platfo_ug43xkxzpru5sofuywkvnd3edy/node_modules/@nestjs/core/injector/injector.js:144:27)
      at TestingInjector.loadInstance (../../node_modules/.pnpm/@nestjs+core@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+platfo_ug43xkxzpru5sofuywkvnd3edy/node_modules/@nestjs/core/injector/injector.js:70:13)
      at TestingInjector.loadController (../../node_modules/.pnpm/@nestjs+core@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+platfo_ug43xkxzpru5sofuywkvnd3edy/node_modules/@nestjs/core/injector/injector.js:89:9)
      at ../../node_modules/.pnpm/@nestjs+core@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+platfo_ug43xkxzpru5sofuywkvnd3edy/node_modules/@nestjs/core/injector/instance-loader.js:68:13
          at async Promise.all (index 1)
      at TestingInstanceLoader.createInstancesOfControllers (../../node_modules/.pnpm/@nestjs+core@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+platfo_ug43xkxzpru5sofuywkvnd3edy/node_modules/@nestjs/core/injector/instance-loader.js:67:9)
      at ../../node_modules/.pnpm/@nestjs+core@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+platfo_ug43xkxzpru5sofuywkvnd3edy/node_modules/@nestjs/core/injector/instance-loader.js:42:13
          at async Promise.all (index 3)
      at TestingInstanceLoader.createInstances (../../node_modules/.pnpm/@nestjs+core@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+platfo_ug43xkxzpru5sofuywkvnd3edy/node_modules/@nestjs/core/injector/instance-loader.js:39:9)
      at TestingInstanceLoader.createInstancesOfDependencies (../../node_modules/.pnpm/@nestjs+core@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+platfo_ug43xkxzpru5sofuywkvnd3edy/node_modules/@nestjs/core/injector/instance-loader.js:22:13)
      at TestingInstanceLoader.createInstancesOfDependencies (../../node_modules/.pnpm/@nestjs+testing@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+cor_q2l2dqhjudmmdjwfrxx4tbtwgy/node_modules/@nestjs/testing/testing-instance-loader.js:9:9)
      at TestingModuleBuilder.createInstancesOfDependencies (../../node_modules/.pnpm/@nestjs+testing@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+cor_q2l2dqhjudmmdjwfrxx4tbtwgy/node_modules/@nestjs/testing/testing-module.builder.js:118:9)
      at TestingModuleBuilder.compile (../../node_modules/.pnpm/@nestjs+testing@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+cor_q2l2dqhjudmmdjwfrxx4tbtwgy/node_modules/@nestjs/testing/testing-module.builder.js:74:9)
      at Object.<anonymous> (test/agents.e2e-spec.ts:31:42)


  ● Test suite failed to run

    TypeError: Cannot read properties of undefined (reading 'close')

    [0m [90m 47 |[39m
     [90m 48 |[39m   afterAll([36masync[39m () [33m=>[39m {
    [31m[1m>[22m[39m[90m 49 |[39m     [36mawait[39m app[33m.[39mclose()
     [90m    |[39m               [31m[1m^[22m[39m
     [90m 50 |[39m   })
     [90m 51 |[39m
     [90m 52 |[39m   it([32m'POST /agents/:id/run should delegate to AgentRunnerService'[39m[33m,[39m [36masync[39m () [33m=>[39m {[0m

      at Object.<anonymous> (test/agents.e2e-spec.ts:49:15)

FAIL apps/api/test/day1-agents.e2e-spec.ts (9.1 s)
  ● Agents API Day 1 flows (e2e) › GET /agents returns the seeded catalog

    Nest can't resolve dependencies of the AgentRunController (AgentRunnerService, ?, AgentTraceService, AgentEvalService). Please make sure that the argument AgentUploadService at index [1] is available in the AgentsModule context.

    Potential solutions:
    - Is AgentsModule a valid NestJS module?
    - If AgentUploadService is a provider, is it part of the current AgentsModule?
    - If AgentUploadService is exported from a separate @Module, is that module imported within AgentsModule?
      @Module({
        imports: [ /* the Module containing AgentUploadService */ ]
      })

    [0m [90m 112 |[39m     }
     [90m 113 |[39m
    [31m[1m>[22m[39m[90m 114 |[39m     [36mconst[39m moduleFixture[33m:[39m [33mTestingModule[39m [33m=[39m [36mawait[39m [33mTest[39m[33m.[39mcreateTestingModule({
     [90m     |[39m                                          [31m[1m^[22m[39m
     [90m 115 |[39m       imports[33m:[39m [[33mAppModule[39m]
     [90m 116 |[39m     })
     [90m 117 |[39m       [33m.[39moverrideProvider([33mAgentRunnerService[39m)[0m

      at TestingInjector.lookupComponentInParentModules (../../node_modules/.pnpm/@nestjs+core@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+platfo_ug43xkxzpru5sofuywkvnd3edy/node_modules/@nestjs/core/injector/injector.js:262:19)
      at TestingInjector.resolveComponentInstance (../../node_modules/.pnpm/@nestjs+core@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+platfo_ug43xkxzpru5sofuywkvnd3edy/node_modules/@nestjs/core/injector/injector.js:215:33)
      at TestingInjector.resolveComponentInstance (../../node_modules/.pnpm/@nestjs+testing@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+cor_q2l2dqhjudmmdjwfrxx4tbtwgy/node_modules/@nestjs/testing/testing-injector.js:19:45)
      at resolveParam (../../node_modules/.pnpm/@nestjs+core@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+platfo_ug43xkxzpru5sofuywkvnd3edy/node_modules/@nestjs/core/injector/injector.js:129:38)
          at async Promise.all (index 1)
      at TestingInjector.resolveConstructorParams (../../node_modules/.pnpm/@nestjs+core@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+platfo_ug43xkxzpru5sofuywkvnd3edy/node_modules/@nestjs/core/injector/injector.js:144:27)
      at TestingInjector.loadInstance (../../node_modules/.pnpm/@nestjs+core@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+platfo_ug43xkxzpru5sofuywkvnd3edy/node_modules/@nestjs/core/injector/injector.js:70:13)
      at TestingInjector.loadController (../../node_modules/.pnpm/@nestjs+core@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+platfo_ug43xkxzpru5sofuywkvnd3edy/node_modules/@nestjs/core/injector/injector.js:89:9)
      at ../../node_modules/.pnpm/@nestjs+core@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+platfo_ug43xkxzpru5sofuywkvnd3edy/node_modules/@nestjs/core/injector/instance-loader.js:68:13
          at async Promise.all (index 1)
      at TestingInstanceLoader.createInstancesOfControllers (../../node_modules/.pnpm/@nestjs+core@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+platfo_ug43xkxzpru5sofuywkvnd3edy/node_modules/@nestjs/core/injector/instance-loader.js:67:9)
      at ../../node_modules/.pnpm/@nestjs+core@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+platfo_ug43xkxzpru5sofuywkvnd3edy/node_modules/@nestjs/core/injector/instance-loader.js:42:13
          at async Promise.all (index 3)
      at TestingInstanceLoader.createInstances (../../node_modules/.pnpm/@nestjs+core@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+platfo_ug43xkxzpru5sofuywkvnd3edy/node_modules/@nestjs/core/injector/instance-loader.js:39:9)
      at TestingInstanceLoader.createInstancesOfDependencies (../../node_modules/.pnpm/@nestjs+core@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+platfo_ug43xkxzpru5sofuywkvnd3edy/node_modules/@nestjs/core/injector/instance-loader.js:22:13)
      at TestingInstanceLoader.createInstancesOfDependencies (../../node_modules/.pnpm/@nestjs+testing@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+cor_q2l2dqhjudmmdjwfrxx4tbtwgy/node_modules/@nestjs/testing/testing-instance-loader.js:9:9)
      at TestingModuleBuilder.createInstancesOfDependencies (../../node_modules/.pnpm/@nestjs+testing@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+cor_q2l2dqhjudmmdjwfrxx4tbtwgy/node_modules/@nestjs/testing/testing-module.builder.js:118:9)
      at TestingModuleBuilder.compile (../../node_modules/.pnpm/@nestjs+testing@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+cor_q2l2dqhjudmmdjwfrxx4tbtwgy/node_modules/@nestjs/testing/testing-module.builder.js:74:9)
      at Object.<anonymous> (test/day1-agents.e2e-spec.ts:114:42)

  ● Agents API Day 1 flows (e2e) › POST /agents/:id/run creates a trace and GET /agents/:id/traces returns it

    Nest can't resolve dependencies of the AgentRunController (AgentRunnerService, ?, AgentTraceService, AgentEvalService). Please make sure that the argument AgentUploadService at index [1] is available in the AgentsModule context.

    Potential solutions:
    - Is AgentsModule a valid NestJS module?
    - If AgentUploadService is a provider, is it part of the current AgentsModule?
    - If AgentUploadService is exported from a separate @Module, is that module imported within AgentsModule?
      @Module({
        imports: [ /* the Module containing AgentUploadService */ ]
      })

    [0m [90m 112 |[39m     }
     [90m 113 |[39m
    [31m[1m>[22m[39m[90m 114 |[39m     [36mconst[39m moduleFixture[33m:[39m [33mTestingModule[39m [33m=[39m [36mawait[39m [33mTest[39m[33m.[39mcreateTestingModule({
     [90m     |[39m                                          [31m[1m^[22m[39m
     [90m 115 |[39m       imports[33m:[39m [[33mAppModule[39m]
     [90m 116 |[39m     })
     [90m 117 |[39m       [33m.[39moverrideProvider([33mAgentRunnerService[39m)[0m

      at TestingInjector.lookupComponentInParentModules (../../node_modules/.pnpm/@nestjs+core@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+platfo_ug43xkxzpru5sofuywkvnd3edy/node_modules/@nestjs/core/injector/injector.js:262:19)
      at TestingInjector.resolveComponentInstance (../../node_modules/.pnpm/@nestjs+core@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+platfo_ug43xkxzpru5sofuywkvnd3edy/node_modules/@nestjs/core/injector/injector.js:215:33)
      at TestingInjector.resolveComponentInstance (../../node_modules/.pnpm/@nestjs+testing@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+cor_q2l2dqhjudmmdjwfrxx4tbtwgy/node_modules/@nestjs/testing/testing-injector.js:19:45)
      at resolveParam (../../node_modules/.pnpm/@nestjs+core@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+platfo_ug43xkxzpru5sofuywkvnd3edy/node_modules/@nestjs/core/injector/injector.js:129:38)
          at async Promise.all (index 1)
      at TestingInjector.resolveConstructorParams (../../node_modules/.pnpm/@nestjs+core@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+platfo_ug43xkxzpru5sofuywkvnd3edy/node_modules/@nestjs/core/injector/injector.js:144:27)
      at TestingInjector.loadInstance (../../node_modules/.pnpm/@nestjs+core@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+platfo_ug43xkxzpru5sofuywkvnd3edy/node_modules/@nestjs/core/injector/injector.js:70:13)
      at TestingInjector.loadController (../../node_modules/.pnpm/@nestjs+core@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+platfo_ug43xkxzpru5sofuywkvnd3edy/node_modules/@nestjs/core/injector/injector.js:89:9)
      at ../../node_modules/.pnpm/@nestjs+core@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+platfo_ug43xkxzpru5sofuywkvnd3edy/node_modules/@nestjs/core/injector/instance-loader.js:68:13
          at async Promise.all (index 1)
      at TestingInstanceLoader.createInstancesOfControllers (../../node_modules/.pnpm/@nestjs+core@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+platfo_ug43xkxzpru5sofuywkvnd3edy/node_modules/@nestjs/core/injector/instance-loader.js:67:9)
      at ../../node_modules/.pnpm/@nestjs+core@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+platfo_ug43xkxzpru5sofuywkvnd3edy/node_modules/@nestjs/core/injector/instance-loader.js:42:13
          at async Promise.all (index 3)
      at TestingInstanceLoader.createInstances (../../node_modules/.pnpm/@nestjs+core@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+platfo_ug43xkxzpru5sofuywkvnd3edy/node_modules/@nestjs/core/injector/instance-loader.js:39:9)
      at TestingInstanceLoader.createInstancesOfDependencies (../../node_modules/.pnpm/@nestjs+core@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+platfo_ug43xkxzpru5sofuywkvnd3edy/node_modules/@nestjs/core/injector/instance-loader.js:22:13)
      at TestingInstanceLoader.createInstancesOfDependencies (../../node_modules/.pnpm/@nestjs+testing@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+cor_q2l2dqhjudmmdjwfrxx4tbtwgy/node_modules/@nestjs/testing/testing-instance-loader.js:9:9)
      at TestingModuleBuilder.createInstancesOfDependencies (../../node_modules/.pnpm/@nestjs+testing@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+cor_q2l2dqhjudmmdjwfrxx4tbtwgy/node_modules/@nestjs/testing/testing-module.builder.js:118:9)
      at TestingModuleBuilder.compile (../../node_modules/.pnpm/@nestjs+testing@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+cor_q2l2dqhjudmmdjwfrxx4tbtwgy/node_modules/@nestjs/testing/testing-module.builder.js:74:9)
      at Object.<anonymous> (test/day1-agents.e2e-spec.ts:114:42)

Test Suites: 4 failed, 4 total
Tests:       8 failed, 8 total
Snapshots:   0 total
Time:        10.048 s
Ran all test suites.
```

#### Stdout
```
[no output]
```

#### Stderr
```
[31m[Nest] 18796  - [39m14/11/2023, 7:13:20 p.m. [31m  ERROR[39m [38;5;3m[AgentEvalService] [39m[31m❌ Error evaluando traza trace-1: openai.evals.runs.create is not a function[39m
[31m[Nest] 18796  - [39m14/11/2023, 7:13:20 p.m. [31m  ERROR[39m [38;5;3m[AgentEvalService] [39m[31m❌ Error evaluando traza trace-2: openai.evals.runs.create is not a function[39m
FAIL apps/api/test/agent-eval.e2e-spec.ts (5.707 s)
  ● AgentEvalService › crea la evaluación y persiste grade/feedback/evaluator

    expect(jest.fn()).toHaveBeenCalledWith(...expected)

    Expected: ObjectContaining {"evaluation_template_id": "tmpl_123", "inputs": [ObjectContaining {"input": "Pregunta original", "output": "Respuesta final"}]}
    Received: {"data_source_config": {"include_sample_schema": true, "item_schema": {"properties": {"agent_name": {"type": "string"}, "completion": {"type": "string"}, "prompt": {"type": "string"}, "trace_id": {"type": "string"}}, "required": ["prompt", "completion"], "type": "object"}, "type": "custom"}, "name": "trace-trace-1-1700000000000", "testing_criteria": [{"input": [{"content": "Eres un evaluador imparcial. Analiza la respuesta del asistente y asigna una puntuación entre 0 y 1 para el criterio \"Claridad técnica\". Evalúa si la respuesta explica conceptos técnicos de forma clara y correcta.", "role": "system", "type": "message"}, {"content": "Prompt del usuario:
    {{item.prompt}}·
    Respuesta del asistente:
    {{item.completion}}", "role": "user", "type": "message"}], "model": "gpt-4o-mini", "name": "Claridad técnica", "pass_threshold": 0.7, "range": [0, 1], "type": "score_model"}, {"input": [{"content": "Eres un evaluador imparcial. Analiza la respuesta del asistente y asigna una puntuación entre 0 y 1 para el criterio \"Coherencia institucional\". Verifica que el mensaje respete el tono y lineamientos institucionales del ENACOM.", "role": "system", "type": "message"}, {"content": "Prompt del usuario:
    {{item.prompt}}·
    Respuesta del asistente:
    {{item.completion}}", "role": "user", "type": "message"}], "model": "gpt-4o-mini", "name": "Coherencia institucional", "pass_threshold": 0.7, "range": [0, 1], "type": "score_model"}, {"input": [{"content": "Eres un evaluador imparcial. Analiza la respuesta del asistente y asigna una puntuación entre 0 y 1 para el criterio \"Nivel de detalle\". Analiza si la respuesta ofrece el nivel de profundidad adecuado para el pedido.", "role": "system", "type": "message"}, {"content": "Prompt del usuario:
    {{item.prompt}}·
    Respuesta del asistente:
    {{item.completion}}", "role": "user", "type": "message"}], "model": "gpt-4o-mini", "name": "Nivel de detalle", "pass_threshold": 0.7, "range": [0, 1], "type": "score_model"}, {"input": [{"content": "Eres un evaluador imparcial. Analiza la respuesta del asistente y asigna una puntuación entre 0 y 1 para el criterio \"Precisión en los datos\". Confirma que los datos aportados sean correctos y estén bien fundamentados.", "role": "system", "type": "message"}, {"content": "Prompt del usuario:
    {{item.prompt}}·
    Respuesta del asistente:
    {{item.completion}}", "role": "user", "type": "message"}], "model": "gpt-4o-mini", "name": "Precisión en los datos", "pass_threshold": 0.7, "range": [0, 1], "type": "score_model"}]}

    Number of calls: 1

    [0m [90m 102 |[39m     [36mawait[39m promise
     [90m 103 |[39m
    [31m[1m>[22m[39m[90m 104 |[39m     expect(createMock)[33m.[39mtoHaveBeenCalledWith(
     [90m     |[39m                        [31m[1m^[22m[39m
     [90m 105 |[39m       expect[33m.[39mobjectContaining({
     [90m 106 |[39m         evaluation_template_id[33m:[39m [32m'tmpl_123'[39m[33m,[39m
     [90m 107 |[39m         inputs[33m:[39m [[0m

      at Object.<anonymous> (test/agent-eval.e2e-spec.ts:104:24)

  ● AgentEvalService › utiliza los resultados del grader cuando la respuesta final llega en el run

    expect(jest.fn()).toHaveBeenCalledWith(...expected)

    - Expected
    + Received

      Object {
        "data": Object {
    -     "evaluator": "grader",
    -     "feedback": "Necesita más detalle",
    -     "grade": 0.42,
    +     "evaluator": "auto-eval",
    +     "feedback": "Error al ejecutar la evaluación automática: openai.evals.runs.create is not a function",
        },
        "where": Object {
          "id": "trace-2",
        },
      },

    Number of calls: 1

    [0m [90m 159 |[39m
     [90m 160 |[39m     expect(retrieveMock)[33m.[39mnot[33m.[39mtoHaveBeenCalled()
    [31m[1m>[22m[39m[90m 161 |[39m     expect(prisma[33m.[39magentTrace[33m.[39mupdate)[33m.[39mtoHaveBeenCalledWith({
     [90m     |[39m                                      [31m[1m^[22m[39m
     [90m 162 |[39m       where[33m:[39m { id[33m:[39m [32m'trace-2'[39m }[33m,[39m
     [90m 163 |[39m       data[33m:[39m {
     [90m 164 |[39m         grade[33m:[39m [35m0.42[39m[33m,[39m[0m

      at Object.<anonymous> (test/agent-eval.e2e-spec.ts:161:38)

FAIL apps/api/test/dashboard.e2e-spec.ts (6.966 s)
  ● DashboardController (e2e) › /dashboard/areas (GET) should return grouped metrics with averages

    Nest can't resolve dependencies of the AgentRunController (AgentRunnerService, ?, AgentTraceService, AgentEvalService). Please make sure that the argument AgentUploadService at index [1] is available in the AgentsModule context.

    Potential solutions:
    - Is AgentsModule a valid NestJS module?
    - If AgentUploadService is a provider, is it part of the current AgentsModule?
    - If AgentUploadService is exported from a separate @Module, is that module imported within AgentsModule?
      @Module({
        imports: [ /* the Module containing AgentUploadService */ ]
      })

    [0m [90m 51 |[39m
     [90m 52 |[39m   beforeAll([36masync[39m () [33m=>[39m {
    [31m[1m>[22m[39m[90m 53 |[39m     [36mconst[39m moduleFixture[33m:[39m [33mTestingModule[39m [33m=[39m [36mawait[39m [33mTest[39m[33m.[39mcreateTestingModule({
     [90m    |[39m                                          [31m[1m^[22m[39m
     [90m 54 |[39m       imports[33m:[39m [[33mAppModule[39m][33m,[39m
     [90m 55 |[39m     })
     [90m 56 |[39m       [33m.[39moverrideProvider([33mPrismaService[39m)[0m

      at TestingInjector.lookupComponentInParentModules (../../node_modules/.pnpm/@nestjs+core@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+platfo_ug43xkxzpru5sofuywkvnd3edy/node_modules/@nestjs/core/injector/injector.js:262:19)
      at TestingInjector.resolveComponentInstance (../../node_modules/.pnpm/@nestjs+core@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+platfo_ug43xkxzpru5sofuywkvnd3edy/node_modules/@nestjs/core/injector/injector.js:215:33)
      at TestingInjector.resolveComponentInstance (../../node_modules/.pnpm/@nestjs+testing@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+cor_q2l2dqhjudmmdjwfrxx4tbtwgy/node_modules/@nestjs/testing/testing-injector.js:19:45)
      at resolveParam (../../node_modules/.pnpm/@nestjs+core@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+platfo_ug43xkxzpru5sofuywkvnd3edy/node_modules/@nestjs/core/injector/injector.js:129:38)
          at async Promise.all (index 1)
      at TestingInjector.resolveConstructorParams (../../node_modules/.pnpm/@nestjs+core@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+platfo_ug43xkxzpru5sofuywkvnd3edy/node_modules/@nestjs/core/injector/injector.js:144:27)
      at TestingInjector.loadInstance (../../node_modules/.pnpm/@nestjs+core@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+platfo_ug43xkxzpru5sofuywkvnd3edy/node_modules/@nestjs/core/injector/injector.js:70:13)
      at TestingInjector.loadController (../../node_modules/.pnpm/@nestjs+core@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+platfo_ug43xkxzpru5sofuywkvnd3edy/node_modules/@nestjs/core/injector/injector.js:89:9)
      at ../../node_modules/.pnpm/@nestjs+core@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+platfo_ug43xkxzpru5sofuywkvnd3edy/node_modules/@nestjs/core/injector/instance-loader.js:68:13
          at async Promise.all (index 1)
      at TestingInstanceLoader.createInstancesOfControllers (../../node_modules/.pnpm/@nestjs+core@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+platfo_ug43xkxzpru5sofuywkvnd3edy/node_modules/@nestjs/core/injector/instance-loader.js:67:9)
      at ../../node_modules/.pnpm/@nestjs+core@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+platfo_ug43xkxzpru5sofuywkvnd3edy/node_modules/@nestjs/core/injector/instance-loader.js:42:13
          at async Promise.all (index 3)
      at TestingInstanceLoader.createInstances (../../node_modules/.pnpm/@nestjs+core@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+platfo_ug43xkxzpru5sofuywkvnd3edy/node_modules/@nestjs/core/injector/instance-loader.js:39:9)
      at TestingInstanceLoader.createInstancesOfDependencies (../../node_modules/.pnpm/@nestjs+core@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+platfo_ug43xkxzpru5sofuywkvnd3edy/node_modules/@nestjs/core/injector/instance-loader.js:22:13)
      at TestingInstanceLoader.createInstancesOfDependencies (../../node_modules/.pnpm/@nestjs+testing@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+cor_q2l2dqhjudmmdjwfrxx4tbtwgy/node_modules/@nestjs/testing/testing-instance-loader.js:9:9)
      at TestingModuleBuilder.createInstancesOfDependencies (../../node_modules/.pnpm/@nestjs+testing@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+cor_q2l2dqhjudmmdjwfrxx4tbtwgy/node_modules/@nestjs/testing/testing-module.builder.js:118:9)
      at TestingModuleBuilder.compile (../../node_modules/.pnpm/@nestjs+testing@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+cor_q2l2dqhjudmmdjwfrxx4tbtwgy/node_modules/@nestjs/testing/testing-module.builder.js:74:9)
      at Object.<anonymous> (test/dashboard.e2e-spec.ts:53:42)

  ● DashboardController (e2e) › /dashboard/leaderboard (GET) should include leaderboard and area summaries

    Nest can't resolve dependencies of the AgentRunController (AgentRunnerService, ?, AgentTraceService, AgentEvalService). Please make sure that the argument AgentUploadService at index [1] is available in the AgentsModule context.

    Potential solutions:
    - Is AgentsModule a valid NestJS module?
    - If AgentUploadService is a provider, is it part of the current AgentsModule?
    - If AgentUploadService is exported from a separate @Module, is that module imported within AgentsModule?
      @Module({
        imports: [ /* the Module containing AgentUploadService */ ]
      })

    [0m [90m 51 |[39m
     [90m 52 |[39m   beforeAll([36masync[39m () [33m=>[39m {
    [31m[1m>[22m[39m[90m 53 |[39m     [36mconst[39m moduleFixture[33m:[39m [33mTestingModule[39m [33m=[39m [36mawait[39m [33mTest[39m[33m.[39mcreateTestingModule({
     [90m    |[39m                                          [31m[1m^[22m[39m
     [90m 54 |[39m       imports[33m:[39m [[33mAppModule[39m][33m,[39m
     [90m 55 |[39m     })
     [90m 56 |[39m       [33m.[39moverrideProvider([33mPrismaService[39m)[0m

      at TestingInjector.lookupComponentInParentModules (../../node_modules/.pnpm/@nestjs+core@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+platfo_ug43xkxzpru5sofuywkvnd3edy/node_modules/@nestjs/core/injector/injector.js:262:19)
      at TestingInjector.resolveComponentInstance (../../node_modules/.pnpm/@nestjs+core@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+platfo_ug43xkxzpru5sofuywkvnd3edy/node_modules/@nestjs/core/injector/injector.js:215:33)
      at TestingInjector.resolveComponentInstance (../../node_modules/.pnpm/@nestjs+testing@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+cor_q2l2dqhjudmmdjwfrxx4tbtwgy/node_modules/@nestjs/testing/testing-injector.js:19:45)
      at resolveParam (../../node_modules/.pnpm/@nestjs+core@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+platfo_ug43xkxzpru5sofuywkvnd3edy/node_modules/@nestjs/core/injector/injector.js:129:38)
          at async Promise.all (index 1)
      at TestingInjector.resolveConstructorParams (../../node_modules/.pnpm/@nestjs+core@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+platfo_ug43xkxzpru5sofuywkvnd3edy/node_modules/@nestjs/core/injector/injector.js:144:27)
      at TestingInjector.loadInstance (../../node_modules/.pnpm/@nestjs+core@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+platfo_ug43xkxzpru5sofuywkvnd3edy/node_modules/@nestjs/core/injector/injector.js:70:13)
      at TestingInjector.loadController (../../node_modules/.pnpm/@nestjs+core@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+platfo_ug43xkxzpru5sofuywkvnd3edy/node_modules/@nestjs/core/injector/injector.js:89:9)
      at ../../node_modules/.pnpm/@nestjs+core@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+platfo_ug43xkxzpru5sofuywkvnd3edy/node_modules/@nestjs/core/injector/instance-loader.js:68:13
          at async Promise.all (index 1)
      at TestingInstanceLoader.createInstancesOfControllers (../../node_modules/.pnpm/@nestjs+core@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+platfo_ug43xkxzpru5sofuywkvnd3edy/node_modules/@nestjs/core/injector/instance-loader.js:67:9)
      at ../../node_modules/.pnpm/@nestjs+core@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+platfo_ug43xkxzpru5sofuywkvnd3edy/node_modules/@nestjs/core/injector/instance-loader.js:42:13
          at async Promise.all (index 3)
      at TestingInstanceLoader.createInstances (../../node_modules/.pnpm/@nestjs+core@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+platfo_ug43xkxzpru5sofuywkvnd3edy/node_modules/@nestjs/core/injector/instance-loader.js:39:9)
      at TestingInstanceLoader.createInstancesOfDependencies (../../node_modules/.pnpm/@nestjs+core@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+platfo_ug43xkxzpru5sofuywkvnd3edy/node_modules/@nestjs/core/injector/instance-loader.js:22:13)
      at TestingInstanceLoader.createInstancesOfDependencies (../../node_modules/.pnpm/@nestjs+testing@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+cor_q2l2dqhjudmmdjwfrxx4tbtwgy/node_modules/@nestjs/testing/testing-instance-loader.js:9:9)
      at TestingModuleBuilder.createInstancesOfDependencies (../../node_modules/.pnpm/@nestjs+testing@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+cor_q2l2dqhjudmmdjwfrxx4tbtwgy/node_modules/@nestjs/testing/testing-module.builder.js:118:9)
      at TestingModuleBuilder.compile (../../node_modules/.pnpm/@nestjs+testing@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+cor_q2l2dqhjudmmdjwfrxx4tbtwgy/node_modules/@nestjs/testing/testing-module.builder.js:74:9)
      at Object.<anonymous> (test/dashboard.e2e-spec.ts:53:42)


  ● Test suite failed to run

    TypeError: Cannot read properties of undefined (reading 'close')

    [0m [90m 150 |[39m
     [90m 151 |[39m   afterAll([36masync[39m () [33m=>[39m {
    [31m[1m>[22m[39m[90m 152 |[39m     [36mawait[39m app[33m.[39mclose()
     [90m     |[39m               [31m[1m^[22m[39m
     [90m 153 |[39m   })
     [90m 154 |[39m })
     [90m 155 |[39m[0m

      at Object.<anonymous> (test/dashboard.e2e-spec.ts:152:15)

FAIL apps/api/test/agents.e2e-spec.ts (6.954 s)
  ● AgentRunController (e2e) › POST /agents/:id/run should delegate to AgentRunnerService

    Nest can't resolve dependencies of the AgentRunController (AgentRunnerService, ?, AgentTraceService, AgentEvalService). Please make sure that the argument AgentUploadService at index [1] is available in the AgentsModule context.

    Potential solutions:
    - Is AgentsModule a valid NestJS module?
    - If AgentUploadService is a provider, is it part of the current AgentsModule?
    - If AgentUploadService is exported from a separate @Module, is that module imported within AgentsModule?
      @Module({
        imports: [ /* the Module containing AgentUploadService */ ]
      })

    [0m [90m 29 |[39m
     [90m 30 |[39m   beforeAll([36masync[39m () [33m=>[39m {
    [31m[1m>[22m[39m[90m 31 |[39m     [36mconst[39m moduleFixture[33m:[39m [33mTestingModule[39m [33m=[39m [36mawait[39m [33mTest[39m[33m.[39mcreateTestingModule({
     [90m    |[39m                                          [31m[1m^[22m[39m
     [90m 32 |[39m       imports[33m:[39m [[33mAppModule[39m]
     [90m 33 |[39m     })
     [90m 34 |[39m       [33m.[39moverrideProvider([33mAgentRunnerService[39m)[0m

      at TestingInjector.lookupComponentInParentModules (../../node_modules/.pnpm/@nestjs+core@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+platfo_ug43xkxzpru5sofuywkvnd3edy/node_modules/@nestjs/core/injector/injector.js:262:19)
      at TestingInjector.resolveComponentInstance (../../node_modules/.pnpm/@nestjs+core@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+platfo_ug43xkxzpru5sofuywkvnd3edy/node_modules/@nestjs/core/injector/injector.js:215:33)
      at TestingInjector.resolveComponentInstance (../../node_modules/.pnpm/@nestjs+testing@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+cor_q2l2dqhjudmmdjwfrxx4tbtwgy/node_modules/@nestjs/testing/testing-injector.js:19:45)
      at resolveParam (../../node_modules/.pnpm/@nestjs+core@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+platfo_ug43xkxzpru5sofuywkvnd3edy/node_modules/@nestjs/core/injector/injector.js:129:38)
          at async Promise.all (index 1)
      at TestingInjector.resolveConstructorParams (../../node_modules/.pnpm/@nestjs+core@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+platfo_ug43xkxzpru5sofuywkvnd3edy/node_modules/@nestjs/core/injector/injector.js:144:27)
      at TestingInjector.loadInstance (../../node_modules/.pnpm/@nestjs+core@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+platfo_ug43xkxzpru5sofuywkvnd3edy/node_modules/@nestjs/core/injector/injector.js:70:13)
      at TestingInjector.loadController (../../node_modules/.pnpm/@nestjs+core@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+platfo_ug43xkxzpru5sofuywkvnd3edy/node_modules/@nestjs/core/injector/injector.js:89:9)
      at ../../node_modules/.pnpm/@nestjs+core@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+platfo_ug43xkxzpru5sofuywkvnd3edy/node_modules/@nestjs/core/injector/instance-loader.js:68:13
          at async Promise.all (index 1)
      at TestingInstanceLoader.createInstancesOfControllers (../../node_modules/.pnpm/@nestjs+core@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+platfo_ug43xkxzpru5sofuywkvnd3edy/node_modules/@nestjs/core/injector/instance-loader.js:67:9)
      at ../../node_modules/.pnpm/@nestjs+core@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+platfo_ug43xkxzpru5sofuywkvnd3edy/node_modules/@nestjs/core/injector/instance-loader.js:42:13
          at async Promise.all (index 3)
      at TestingInstanceLoader.createInstances (../../node_modules/.pnpm/@nestjs+core@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+platfo_ug43xkxzpru5sofuywkvnd3edy/node_modules/@nestjs/core/injector/instance-loader.js:39:9)
      at TestingInstanceLoader.createInstancesOfDependencies (../../node_modules/.pnpm/@nestjs+core@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+platfo_ug43xkxzpru5sofuywkvnd3edy/node_modules/@nestjs/core/injector/instance-loader.js:22:13)
      at TestingInstanceLoader.createInstancesOfDependencies (../../node_modules/.pnpm/@nestjs+testing@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+cor_q2l2dqhjudmmdjwfrxx4tbtwgy/node_modules/@nestjs/testing/testing-instance-loader.js:9:9)
      at TestingModuleBuilder.createInstancesOfDependencies (../../node_modules/.pnpm/@nestjs+testing@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+cor_q2l2dqhjudmmdjwfrxx4tbtwgy/node_modules/@nestjs/testing/testing-module.builder.js:118:9)
      at TestingModuleBuilder.compile (../../node_modules/.pnpm/@nestjs+testing@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+cor_q2l2dqhjudmmdjwfrxx4tbtwgy/node_modules/@nestjs/testing/testing-module.builder.js:74:9)
      at Object.<anonymous> (test/agents.e2e-spec.ts:31:42)

  ● AgentRunController (e2e) › GET /agents/:id/traces should return trace summaries from AgentRunnerService

    Nest can't resolve dependencies of the AgentRunController (AgentRunnerService, ?, AgentTraceService, AgentEvalService). Please make sure that the argument AgentUploadService at index [1] is available in the AgentsModule context.

    Potential solutions:
    - Is AgentsModule a valid NestJS module?
    - If AgentUploadService is a provider, is it part of the current AgentsModule?
    - If AgentUploadService is exported from a separate @Module, is that module imported within AgentsModule?
      @Module({
        imports: [ /* the Module containing AgentUploadService */ ]
      })

    [0m [90m 29 |[39m
     [90m 30 |[39m   beforeAll([36masync[39m () [33m=>[39m {
    [31m[1m>[22m[39m[90m 31 |[39m     [36mconst[39m moduleFixture[33m:[39m [33mTestingModule[39m [33m=[39m [36mawait[39m [33mTest[39m[33m.[39mcreateTestingModule({
     [90m    |[39m                                          [31m[1m^[22m[39m
     [90m 32 |[39m       imports[33m:[39m [[33mAppModule[39m]
     [90m 33 |[39m     })
     [90m 34 |[39m       [33m.[39moverrideProvider([33mAgentRunnerService[39m)[0m

      at TestingInjector.lookupComponentInParentModules (../../node_modules/.pnpm/@nestjs+core@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+platfo_ug43xkxzpru5sofuywkvnd3edy/node_modules/@nestjs/core/injector/injector.js:262:19)
      at TestingInjector.resolveComponentInstance (../../node_modules/.pnpm/@nestjs+core@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+platfo_ug43xkxzpru5sofuywkvnd3edy/node_modules/@nestjs/core/injector/injector.js:215:33)
      at TestingInjector.resolveComponentInstance (../../node_modules/.pnpm/@nestjs+testing@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+cor_q2l2dqhjudmmdjwfrxx4tbtwgy/node_modules/@nestjs/testing/testing-injector.js:19:45)
      at resolveParam (../../node_modules/.pnpm/@nestjs+core@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+platfo_ug43xkxzpru5sofuywkvnd3edy/node_modules/@nestjs/core/injector/injector.js:129:38)
          at async Promise.all (index 1)
      at TestingInjector.resolveConstructorParams (../../node_modules/.pnpm/@nestjs+core@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+platfo_ug43xkxzpru5sofuywkvnd3edy/node_modules/@nestjs/core/injector/injector.js:144:27)
      at TestingInjector.loadInstance (../../node_modules/.pnpm/@nestjs+core@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+platfo_ug43xkxzpru5sofuywkvnd3edy/node_modules/@nestjs/core/injector/injector.js:70:13)
      at TestingInjector.loadController (../../node_modules/.pnpm/@nestjs+core@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+platfo_ug43xkxzpru5sofuywkvnd3edy/node_modules/@nestjs/core/injector/injector.js:89:9)
      at ../../node_modules/.pnpm/@nestjs+core@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+platfo_ug43xkxzpru5sofuywkvnd3edy/node_modules/@nestjs/core/injector/instance-loader.js:68:13
          at async Promise.all (index 1)
      at TestingInstanceLoader.createInstancesOfControllers (../../node_modules/.pnpm/@nestjs+core@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+platfo_ug43xkxzpru5sofuywkvnd3edy/node_modules/@nestjs/core/injector/instance-loader.js:67:9)
      at ../../node_modules/.pnpm/@nestjs+core@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+platfo_ug43xkxzpru5sofuywkvnd3edy/node_modules/@nestjs/core/injector/instance-loader.js:42:13
          at async Promise.all (index 3)
      at TestingInstanceLoader.createInstances (../../node_modules/.pnpm/@nestjs+core@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+platfo_ug43xkxzpru5sofuywkvnd3edy/node_modules/@nestjs/core/injector/instance-loader.js:39:9)
      at TestingInstanceLoader.createInstancesOfDependencies (../../node_modules/.pnpm/@nestjs+core@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+platfo_ug43xkxzpru5sofuywkvnd3edy/node_modules/@nestjs/core/injector/instance-loader.js:22:13)
      at TestingInstanceLoader.createInstancesOfDependencies (../../node_modules/.pnpm/@nestjs+testing@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+cor_q2l2dqhjudmmdjwfrxx4tbtwgy/node_modules/@nestjs/testing/testing-instance-loader.js:9:9)
      at TestingModuleBuilder.createInstancesOfDependencies (../../node_modules/.pnpm/@nestjs+testing@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+cor_q2l2dqhjudmmdjwfrxx4tbtwgy/node_modules/@nestjs/testing/testing-module.builder.js:118:9)
      at TestingModuleBuilder.compile (../../node_modules/.pnpm/@nestjs+testing@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+cor_q2l2dqhjudmmdjwfrxx4tbtwgy/node_modules/@nestjs/testing/testing-module.builder.js:74:9)
      at Object.<anonymous> (test/agents.e2e-spec.ts:31:42)


  ● Test suite failed to run

    TypeError: Cannot read properties of undefined (reading 'close')

    [0m [90m 47 |[39m
     [90m 48 |[39m   afterAll([36masync[39m () [33m=>[39m {
    [31m[1m>[22m[39m[90m 49 |[39m     [36mawait[39m app[33m.[39mclose()
     [90m    |[39m               [31m[1m^[22m[39m
     [90m 50 |[39m   })
     [90m 51 |[39m
     [90m 52 |[39m   it([32m'POST /agents/:id/run should delegate to AgentRunnerService'[39m[33m,[39m [36masync[39m () [33m=>[39m {[0m

      at Object.<anonymous> (test/agents.e2e-spec.ts:49:15)

FAIL apps/api/test/day1-agents.e2e-spec.ts (9.1 s)
  ● Agents API Day 1 flows (e2e) › GET /agents returns the seeded catalog

    Nest can't resolve dependencies of the AgentRunController (AgentRunnerService, ?, AgentTraceService, AgentEvalService). Please make sure that the argument AgentUploadService at index [1] is available in the AgentsModule context.

    Potential solutions:
    - Is AgentsModule a valid NestJS module?
    - If AgentUploadService is a provider, is it part of the current AgentsModule?
    - If AgentUploadService is exported from a separate @Module, is that module imported within AgentsModule?
      @Module({
        imports: [ /* the Module containing AgentUploadService */ ]
      })

    [0m [90m 112 |[39m     }
     [90m 113 |[39m
    [31m[1m>[22m[39m[90m 114 |[39m     [36mconst[39m moduleFixture[33m:[39m [33mTestingModule[39m [33m=[39m [36mawait[39m [33mTest[39m[33m.[39mcreateTestingModule({
     [90m     |[39m                                          [31m[1m^[22m[39m
     [90m 115 |[39m       imports[33m:[39m [[33mAppModule[39m]
     [90m 116 |[39m     })
     [90m 117 |[39m       [33m.[39moverrideProvider([33mAgentRunnerService[39m)[0m

      at TestingInjector.lookupComponentInParentModules (../../node_modules/.pnpm/@nestjs+core@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+platfo_ug43xkxzpru5sofuywkvnd3edy/node_modules/@nestjs/core/injector/injector.js:262:19)
      at TestingInjector.resolveComponentInstance (../../node_modules/.pnpm/@nestjs+core@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+platfo_ug43xkxzpru5sofuywkvnd3edy/node_modules/@nestjs/core/injector/injector.js:215:33)
      at TestingInjector.resolveComponentInstance (../../node_modules/.pnpm/@nestjs+testing@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+cor_q2l2dqhjudmmdjwfrxx4tbtwgy/node_modules/@nestjs/testing/testing-injector.js:19:45)
      at resolveParam (../../node_modules/.pnpm/@nestjs+core@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+platfo_ug43xkxzpru5sofuywkvnd3edy/node_modules/@nestjs/core/injector/injector.js:129:38)
          at async Promise.all (index 1)
      at TestingInjector.resolveConstructorParams (../../node_modules/.pnpm/@nestjs+core@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+platfo_ug43xkxzpru5sofuywkvnd3edy/node_modules/@nestjs/core/injector/injector.js:144:27)
      at TestingInjector.loadInstance (../../node_modules/.pnpm/@nestjs+core@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+platfo_ug43xkxzpru5sofuywkvnd3edy/node_modules/@nestjs/core/injector/injector.js:70:13)
      at TestingInjector.loadController (../../node_modules/.pnpm/@nestjs+core@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+platfo_ug43xkxzpru5sofuywkvnd3edy/node_modules/@nestjs/core/injector/injector.js:89:9)
      at ../../node_modules/.pnpm/@nestjs+core@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+platfo_ug43xkxzpru5sofuywkvnd3edy/node_modules/@nestjs/core/injector/instance-loader.js:68:13
          at async Promise.all (index 1)
      at TestingInstanceLoader.createInstancesOfControllers (../../node_modules/.pnpm/@nestjs+core@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+platfo_ug43xkxzpru5sofuywkvnd3edy/node_modules/@nestjs/core/injector/instance-loader.js:67:9)
      at ../../node_modules/.pnpm/@nestjs+core@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+platfo_ug43xkxzpru5sofuywkvnd3edy/node_modules/@nestjs/core/injector/instance-loader.js:42:13
          at async Promise.all (index 3)
      at TestingInstanceLoader.createInstances (../../node_modules/.pnpm/@nestjs+core@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+platfo_ug43xkxzpru5sofuywkvnd3edy/node_modules/@nestjs/core/injector/instance-loader.js:39:9)
      at TestingInstanceLoader.createInstancesOfDependencies (../../node_modules/.pnpm/@nestjs+core@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+platfo_ug43xkxzpru5sofuywkvnd3edy/node_modules/@nestjs/core/injector/instance-loader.js:22:13)
      at TestingInstanceLoader.createInstancesOfDependencies (../../node_modules/.pnpm/@nestjs+testing@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+cor_q2l2dqhjudmmdjwfrxx4tbtwgy/node_modules/@nestjs/testing/testing-instance-loader.js:9:9)
      at TestingModuleBuilder.createInstancesOfDependencies (../../node_modules/.pnpm/@nestjs+testing@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+cor_q2l2dqhjudmmdjwfrxx4tbtwgy/node_modules/@nestjs/testing/testing-module.builder.js:118:9)
      at TestingModuleBuilder.compile (../../node_modules/.pnpm/@nestjs+testing@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+cor_q2l2dqhjudmmdjwfrxx4tbtwgy/node_modules/@nestjs/testing/testing-module.builder.js:74:9)
      at Object.<anonymous> (test/day1-agents.e2e-spec.ts:114:42)

  ● Agents API Day 1 flows (e2e) › POST /agents/:id/run creates a trace and GET /agents/:id/traces returns it

    Nest can't resolve dependencies of the AgentRunController (AgentRunnerService, ?, AgentTraceService, AgentEvalService). Please make sure that the argument AgentUploadService at index [1] is available in the AgentsModule context.

    Potential solutions:
    - Is AgentsModule a valid NestJS module?
    - If AgentUploadService is a provider, is it part of the current AgentsModule?
    - If AgentUploadService is exported from a separate @Module, is that module imported within AgentsModule?
      @Module({
        imports: [ /* the Module containing AgentUploadService */ ]
      })

    [0m [90m 112 |[39m     }
     [90m 113 |[39m
    [31m[1m>[22m[39m[90m 114 |[39m     [36mconst[39m moduleFixture[33m:[39m [33mTestingModule[39m [33m=[39m [36mawait[39m [33mTest[39m[33m.[39mcreateTestingModule({
     [90m     |[39m                                          [31m[1m^[22m[39m
     [90m 115 |[39m       imports[33m:[39m [[33mAppModule[39m]
     [90m 116 |[39m     })
     [90m 117 |[39m       [33m.[39moverrideProvider([33mAgentRunnerService[39m)[0m

      at TestingInjector.lookupComponentInParentModules (../../node_modules/.pnpm/@nestjs+core@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+platfo_ug43xkxzpru5sofuywkvnd3edy/node_modules/@nestjs/core/injector/injector.js:262:19)
      at TestingInjector.resolveComponentInstance (../../node_modules/.pnpm/@nestjs+core@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+platfo_ug43xkxzpru5sofuywkvnd3edy/node_modules/@nestjs/core/injector/injector.js:215:33)
      at TestingInjector.resolveComponentInstance (../../node_modules/.pnpm/@nestjs+testing@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+cor_q2l2dqhjudmmdjwfrxx4tbtwgy/node_modules/@nestjs/testing/testing-injector.js:19:45)
      at resolveParam (../../node_modules/.pnpm/@nestjs+core@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+platfo_ug43xkxzpru5sofuywkvnd3edy/node_modules/@nestjs/core/injector/injector.js:129:38)
          at async Promise.all (index 1)
      at TestingInjector.resolveConstructorParams (../../node_modules/.pnpm/@nestjs+core@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+platfo_ug43xkxzpru5sofuywkvnd3edy/node_modules/@nestjs/core/injector/injector.js:144:27)
      at TestingInjector.loadInstance (../../node_modules/.pnpm/@nestjs+core@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+platfo_ug43xkxzpru5sofuywkvnd3edy/node_modules/@nestjs/core/injector/injector.js:70:13)
      at TestingInjector.loadController (../../node_modules/.pnpm/@nestjs+core@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+platfo_ug43xkxzpru5sofuywkvnd3edy/node_modules/@nestjs/core/injector/injector.js:89:9)
      at ../../node_modules/.pnpm/@nestjs+core@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+platfo_ug43xkxzpru5sofuywkvnd3edy/node_modules/@nestjs/core/injector/instance-loader.js:68:13
          at async Promise.all (index 1)
      at TestingInstanceLoader.createInstancesOfControllers (../../node_modules/.pnpm/@nestjs+core@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+platfo_ug43xkxzpru5sofuywkvnd3edy/node_modules/@nestjs/core/injector/instance-loader.js:67:9)
      at ../../node_modules/.pnpm/@nestjs+core@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+platfo_ug43xkxzpru5sofuywkvnd3edy/node_modules/@nestjs/core/injector/instance-loader.js:42:13
          at async Promise.all (index 3)
      at TestingInstanceLoader.createInstances (../../node_modules/.pnpm/@nestjs+core@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+platfo_ug43xkxzpru5sofuywkvnd3edy/node_modules/@nestjs/core/injector/instance-loader.js:39:9)
      at TestingInstanceLoader.createInstancesOfDependencies (../../node_modules/.pnpm/@nestjs+core@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+platfo_ug43xkxzpru5sofuywkvnd3edy/node_modules/@nestjs/core/injector/instance-loader.js:22:13)
      at TestingInstanceLoader.createInstancesOfDependencies (../../node_modules/.pnpm/@nestjs+testing@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+cor_q2l2dqhjudmmdjwfrxx4tbtwgy/node_modules/@nestjs/testing/testing-instance-loader.js:9:9)
      at TestingModuleBuilder.createInstancesOfDependencies (../../node_modules/.pnpm/@nestjs+testing@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+cor_q2l2dqhjudmmdjwfrxx4tbtwgy/node_modules/@nestjs/testing/testing-module.builder.js:118:9)
      at TestingModuleBuilder.compile (../../node_modules/.pnpm/@nestjs+testing@10.4.20_@nestjs+common@10.4.20_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+cor_q2l2dqhjudmmdjwfrxx4tbtwgy/node_modules/@nestjs/testing/testing-module.builder.js:74:9)
      at Object.<anonymous> (test/day1-agents.e2e-spec.ts:114:42)

Test Suites: 4 failed, 4 total
Tests:       8 failed, 8 total
Snapshots:   0 total
Time:        10.048 s
Ran all test suites.
```

### Web test suite
- Command: `pnpm exec jest --config apps/web/jest.config.ts`
- Status: passed
- Exit code: 0

#### Stdout
```
  console.warn
    The width(0) and height(0) of chart should be greater than 0,
           please check the style of container, or the props width(100%) and height(100%),
           or add a minWidth(0) or minHeight(undefined) or use aspect(undefined) to control the
           height and width.

      at warn (../../node_modules/.pnpm/recharts@2.15.4_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/recharts/lib/util/LogUtils.js:22:17)
      at ../../node_modules/.pnpm/recharts@2.15.4_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/recharts/lib/component/ResponsiveContainer.js:136:24
      at updateMemo (../../node_modules/.pnpm/react-dom@18.3.1_react@18.3.1/node_modules/react-dom/cjs/react-dom.development.js:16427:19)
      at Object.useMemo (../../node_modules/.pnpm/react-dom@18.3.1_react@18.3.1/node_modules/react-dom/cjs/react-dom.development.js:17067:16)
      at useMemo (../../node_modules/.pnpm/react@18.3.1/node_modules/react/cjs/react.development.js:1650:21)
      at ../../node_modules/.pnpm/recharts@2.15.4_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/recharts/lib/component/ResponsiveContainer.js:111:41
      at renderWithHooks (../../node_modules/.pnpm/react-dom@18.3.1_react@18.3.1/node_modules/react-dom/cjs/react-dom.development.js:15486:18)
      at updateForwardRef (../../node_modules/.pnpm/react-dom@18.3.1_react@18.3.1/node_modules/react-dom/cjs/react-dom.development.js:19245:20)
      at beginWork (../../node_modules/.pnpm/react-dom@18.3.1_react@18.3.1/node_modules/react-dom/cjs/react-dom.development.js:21675:16)
      at beginWork$1 (../../node_modules/.pnpm/react-dom@18.3.1_react@18.3.1/node_modules/react-dom/cjs/react-dom.development.js:27465:14)
      at performUnitOfWork (../../node_modules/.pnpm/react-dom@18.3.1_react@18.3.1/node_modules/react-dom/cjs/react-dom.development.js:26599:12)
      at workLoopSync (../../node_modules/.pnpm/react-dom@18.3.1_react@18.3.1/node_modules/react-dom/cjs/react-dom.development.js:26505:5)
      at renderRootSync (../../node_modules/.pnpm/react-dom@18.3.1_react@18.3.1/node_modules/react-dom/cjs/react-dom.development.js:26473:7)
      at performConcurrentWorkOnRoot (../../node_modules/.pnpm/react-dom@18.3.1_react@18.3.1/node_modules/react-dom/cjs/react-dom.development.js:25777:74)
      at workLoop (../../node_modules/.pnpm/scheduler@0.23.2/node_modules/scheduler/cjs/scheduler.development.js:266:34)
      at flushWork (../../node_modules/.pnpm/scheduler@0.23.2/node_modules/scheduler/cjs/scheduler.development.js:239:14)
      at performWorkUntilDeadline (../../node_modules/.pnpm/scheduler@0.23.2/node_modules/scheduler/cjs/scheduler.development.js:533:21)
      at Timeout.task [as _onTimeout] (../../node_modules/.pnpm/jsdom@20.0.3/node_modules/jsdom/lib/jsdom/browser/Window.js:520:19)
```

#### Stderr
```
[no output]
```

One or more diagnostics checks did not pass.
❌ Error ejecutando diagnóstico.
```

---
✅ **Reporte generado automáticamente:** reports/status/project-status-2025-10-12_13-14.md
