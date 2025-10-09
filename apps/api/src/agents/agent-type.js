"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inferAgentType = inferAgentType;
var KEYWORD_GROUPS = [
    {
        type: 'technical',
        patterns: [
            /t[ée]cnic[oa]/i,
            /infraestructura/i,
            /radiocomunicaciones?/i,
            /tecnolog[ií]a/i,
            /ingenier[ií]a/i
        ]
    },
    {
        type: 'financial',
        patterns: [
            /financier[ao]/i,
            /contable/i,
            /presupuesto/i,
            /presupuestari[ao]/i,
            /tesorer[ií]a/i
        ]
    },
    {
        type: 'regulatory',
        patterns: [
            /licencias?/i,
            /permisos?/i,
            /regulatori[oa]/i,
            /normativa/i,
            /expediente/i
        ]
    },
    {
        type: 'reporting',
        patterns: [
            /informes?/i,
            /reportes?/i,
            /tablero/i,
            /dashboard/i,
            /resumen/i,
            /ejecutivo/i
        ]
    },
    {
        type: 'risk',
        patterns: [/riesgos?/i, /auditor[ií]a/i, /alerta/i]
    },
    {
        type: 'planning',
        patterns: [
            /planificaci[oó]n/i,
            /planificador/i,
            /proyectos?/i,
            /estrat[ée]gic[oa]/i,
            /planeamiento/i
        ]
    }
];
function inferAgentType(name) {
    for (var _i = 0, KEYWORD_GROUPS_1 = KEYWORD_GROUPS; _i < KEYWORD_GROUPS_1.length; _i++) {
        var group = KEYWORD_GROUPS_1[_i];
        if (group.patterns.some(function (pattern) { return pattern.test(name); })) {
            return group.type;
        }
    }
    return 'general';
}
