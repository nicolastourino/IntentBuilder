export const INTENTS = [
  {
    _id: '1', type: 'identifyPatientByDocument',
    description: 'Identifica al paciente por documento de identidad',
    badge: 'Starter', canBeStarter: true, pasos: 5, inputs: 2,
    createdAt: '12/11/2024 09:14', updatedAt: '01/12/2024 16:42',
    input: [
      { name: 'utterance',       type: 'String', required: true,  notes: '' },
      { name: 'documentNumber',  type: 'String', required: true,  notes: 'Cedula o pasaporte' },
    ],
    workflow: [
      { step: 0, type: 'obtainValue', title: 'validateInputs', modules: [
        { type: 'conditional', condition: "payload.stepResults.filter(sr => sr.step == 0)[0].value.success === false || payload.stepResults.filter(sr => sr.step == 0)[0].value.data.length == 0",
          conditionTrueModules: [{ type: 'returnValue', value: '[{type:"error",code:400}]' }], conditionFalseModules: [] },
      ]},
      { step: 1, type: 'obtainValue', title: 'findPatient', modules: [
        { type: 'apiCall', url: 'https://api.example.com/patients/search', method: 'GET', headers: [], parameters: { document: '${input.documentNumber}' }, outputVariableName: 'patientResult', outputVariableScope: 'let' },
      ]},
      { step: 2, type: 'jumpToStep', title: 'checkResult', modules: [
        { type: 'conditional', condition: "payload.stepResults.filter(sr => sr.step == 1)[0].value.success && payload.stepResults.filter(sr => sr.step == 1)[0].value.data.length > 0",
          conditionTrueModules: [{ type: 'returnValue', value: 3 }], conditionFalseModules: [{ type: 'returnValue', value: 4 }] },
      ]},
      { step: 3, type: 'returnResult', title: 'returnPatient',   modules: [{ type: 'returnValue', value: '[{type:"patient_found",data:patientResult.data}]' }] },
      { step: 4, type: 'returnResult', title: 'returnNotFound',  modules: [{ type: 'returnValue', value: '[{type:"patient_not_found"}]' }] },
    ],
  },
  {
    _id: '2', type: 'scheduleAppointment',
    description: 'Agendamiento completo de cita medica con validacion multi-paso',
    badge: 'Starter', canBeStarter: true, pasos: 7, inputs: 9,
    createdAt: '28/10/2024 10:17', updatedAt: '03/12/2024 09:38',
    input: [
      { name: 'utterance',         type: 'String', required: true,  notes: '' },
      { name: 'patientId',         type: 'Number', required: true,  notes: '' },
      { name: 'serviceId',         type: 'Number', required: false, notes: '' },
      { name: 'scheduleId',        type: 'Number', required: false, notes: '' },
      { name: 'date',              type: 'String', required: false, notes: '' },
      { name: 'time',              type: 'String', required: false, notes: '' },
      { name: 'dateFrom',          type: 'String', required: false, notes: '' },
      { name: 'dateTo',            type: 'String', required: false, notes: '' },
      { name: 'serviceSearchTerm', type: 'String', required: false, notes: '' },
    ],
    workflow: [
      { step: 0, type: 'obtainValue', title: 'validateInputs', modules: [
        { type: 'conditional', condition: "payload.stepResults.filter(sr => sr.step == 0)[0].value.success === false",
          conditionTrueModules: [{ type: 'returnValue', value: '[{type:"error",message:"patientId required"}]' }], conditionFalseModules: [] },
      ]},
      { step: 1, type: 'obtainValue', title: 'getPatientInfo', modules: [
        { type: 'apiCall', url: 'https://api.example.com/patients/{patientId}', method: 'GET', headers: [], parameters: {}, outputVariableName: 'patient', outputVariableScope: 'let' },
        { type: 'log', value: 'patient?.id' },
      ]},
      { step: 2, type: 'obtainValue', title: 'searchServices', modules: [
        { type: 'apiCall', url: 'https://api.example.com/services', method: 'GET', headers: [], parameters: { search: '${input.serviceSearchTerm}' }, outputVariableName: 'services', outputVariableScope: 'let' },
        { type: 'variableDefinition', variableName: 'selectedService', variableScope: 'let', value: 'services?.data?.[0]' },
      ]},
      { step: 3, type: 'obtainValue', title: 'getAvailability', modules: [
        { type: 'apiCall', url: 'https://api.example.com/availability', method: 'POST', headers: [{ name: 'Content-Type', value: 'application/json' }], parameters: { serviceId: '${input.serviceId}' }, outputVariableName: 'availability', outputVariableScope: 'let' },
      ]},
      { step: 4, type: 'jumpToStep', title: 'checkSuccess', modules: [
        { type: 'conditional', condition: "payload.stepResults.filter(sr => sr.step == 3)[0].value.success && payload.stepResults.filter(sr => sr.step == 3)[0].value.data.length > 0",
          conditionTrueModules: [{ type: 'returnValue', value: 5 }], conditionFalseModules: [{ type: 'returnValue', value: 2 }] },
      ]},
      { step: 5, type: 'obtainValue', title: 'bookAppointment', modules: [
        { type: 'apiCall', url: 'https://api.example.com/appointments', method: 'POST', headers: [{ name: 'Content-Type', value: 'application/json' }], parameters: { patientId: '${input.patientId}' }, outputVariableName: 'appointment', outputVariableScope: 'let' },
      ]},
      { step: 6, type: 'returnResult', title: 'buildResponse', modules: [
        { type: 'returnValue', value: '[{type:"appointment_confirmed",data:appointment}]' },
      ]},
    ],
  },
  {
    _id: '3', type: 'cancelAppointment',
    description: 'Cancelacion de cita medica',
    badge: null, canBeStarter: false, pasos: 5, inputs: 3,
    createdAt: '05/11/2024 17:03', updatedAt: '22/11/2024 14:55',
    input: [
      { name: 'utterance',      type: 'String', required: true,  notes: '' },
      { name: 'patientId',      type: 'Number', required: true,  notes: '' },
      { name: 'appointmentId',  type: 'Number', required: true,  notes: '' },
    ],
    workflow: [
      { step: 0, type: 'obtainValue', title: 'validateInputs', modules: [
        { type: 'conditional', condition: "payload.stepResults.filter(sr => sr.step == 0)[0].value.success === false",
          conditionTrueModules: [{ type: 'returnValue', value: '[{type:"error"}]' }], conditionFalseModules: [] },
      ]},
      { step: 1, type: 'obtainValue', title: 'cancelAppointment', modules: [
        { type: 'apiCall', url: 'https://api.example.com/appointments/{appointmentId}', method: 'DELETE', headers: [], parameters: {}, outputVariableName: 'result', outputVariableScope: 'let' },
      ]},
      { step: 2, type: 'jumpToStep', title: 'checkResult', modules: [
        { type: 'conditional', condition: "payload.stepResults.filter(sr => sr.step == 1)[0].value.success === true",
          conditionTrueModules: [{ type: 'returnValue', value: 3 }], conditionFalseModules: [{ type: 'returnValue', value: 4 }] },
      ]},
      { step: 3, type: 'returnResult', title: 'returnSuccess', modules: [{ type: 'returnValue', value: '[{type:"cancelled",success:true}]' }] },
      { step: 4, type: 'returnResult', title: 'returnError',   modules: [{ type: 'returnValue', value: '[{type:"cancel_error"}]' }] },
    ],
  },
  {
    _id: '4', type: 'getPatientHistory',
    description: 'Historial medico con cache',
    badge: 'Core', canBeStarter: false, pasos: 4, inputs: 3,
    createdAt: '05/10/2024 14:12', updatedAt: '02/12/2024 17:00',
    input: [
      { name: 'utterance',  type: 'String', required: true,  notes: '' },
      { name: 'patientId',  type: 'Number', required: true,  notes: '' },
      { name: 'limit',      type: 'Number', required: false, notes: 'Max registros' },
    ],
    workflow: [
      { step: 0, type: 'obtainValue', title: 'validate', modules: [
        { type: 'conditional', condition: "payload.stepResults.filter(sr => sr.step == 0)[0].value.success === false",
          conditionTrueModules: [{ type: 'returnValue', value: '[{type:"error"}]' }], conditionFalseModules: [] },
      ]},
      { step: 1, type: 'obtainValue', title: 'checkCache', modules: [
        { type: 'cache', key: 'history-${input.patientId}', outputVariableName: 'cachedHistory', outputVariableScope: 'let', expiresIn: 300 },
        { type: 'conditional', condition: "payload.stepResults.filter(sr => sr.step == 1)[0].value.hit === true",
          conditionTrueModules: [{ type: 'returnValue', value: '[{type:"history",data:cachedHistory}]' }], conditionFalseModules: [] },
      ]},
      { step: 2, type: 'obtainValue', title: 'fetchHistory', modules: [
        { type: 'apiCall', url: 'https://api.example.com/patients/{patientId}/history', method: 'GET', headers: [], parameters: { limit: '${input.limit||20}' }, outputVariableName: 'history', outputVariableScope: 'let' },
      ]},
      { step: 3, type: 'returnResult', title: 'buildResponse', modules: [{ type: 'returnValue', value: '[{type:"history",data:history}]' }] },
    ],
  },
  {
    _id: '5', type: 'checkAvailability',
    description: 'Verifica disponibilidad de agenda',
    badge: 'Core', canBeStarter: false, pasos: 3, inputs: 4,
    createdAt: '22/09/2024 08:22', updatedAt: '28/11/2024 10:55',
    input: [
      { name: 'utterance',  type: 'String', required: true, notes: '' },
      { name: 'serviceId',  type: 'Number', required: true, notes: '' },
      { name: 'dateFrom',   type: 'String', required: true, notes: '' },
      { name: 'dateTo',     type: 'String', required: true, notes: '' },
    ],
    workflow: [
      { step: 0, type: 'obtainValue', title: 'validate', modules: [
        { type: 'conditional', condition: "payload.stepResults.filter(sr => sr.step == 0)[0].value.success === false",
          conditionTrueModules: [{ type: 'returnValue', value: '[{type:"error"}]' }], conditionFalseModules: [] },
      ]},
      { step: 1, type: 'obtainValue', title: 'getSlots', modules: [
        { type: 'apiCall', url: 'https://api.example.com/slots', method: 'GET', headers: [], parameters: { serviceId: '${input.serviceId}' }, outputVariableName: 'slots', outputVariableScope: 'let' },
      ]},
      { step: 2, type: 'returnResult', title: 'buildResponse', modules: [{ type: 'returnValue', value: '[{type:"availability",slots:slots?.data}]' }] },
    ],
  },
  {
    _id: '6', type: 'escalateToAgent',
    description: 'Escalamiento a agente humano',
    badge: null, canBeStarter: false, pasos: 2, inputs: 2,
    createdAt: '10/09/2024 13:55', updatedAt: '30/11/2024 18:02',
    input: [
      { name: 'utterance', type: 'String', required: true,  notes: '' },
      { name: 'reason',    type: 'String', required: false, notes: '' },
    ],
    workflow: [
      { step: 0, type: 'obtainValue', title: 'logEscalation', modules: [{ type: 'log', value: 'input.reason' }] },
      { step: 1, type: 'returnResult', title: 'returnEscalate', modules: [{ type: 'returnValue', value: '[{type:"escalate",reason:input.reason}]' }] },
    ],
  },
  {
    _id: '7', type: 'processCopayment',
    description: 'Procesamiento de copago medico',
    badge: 'Advanced', canBeStarter: false, pasos: 3, inputs: 4,
    createdAt: '18/09/2024 16:08', updatedAt: '01/12/2024 09:14',
    input: [
      { name: 'utterance',      type: 'String', required: true,  notes: '' },
      { name: 'patientId',      type: 'Number', required: true,  notes: '' },
      { name: 'appointmentId',  type: 'Number', required: true,  notes: '' },
      { name: 'amount',         type: 'Number', required: false, notes: '' },
    ],
    workflow: [
      { step: 0, type: 'obtainValue', title: 'calculateAmount', modules: [
        { type: 'apiCall', url: 'https://api.example.com/copayments/calculate', method: 'POST', headers: [{ name: 'Content-Type', value: 'application/json' }], parameters: { appointmentId: '${input.appointmentId}' }, outputVariableName: 'copayment', outputVariableScope: 'let' },
        { type: 'variableDefinition', variableName: 'finalAmount', variableScope: 'let', value: 'input.amount||copayment?.amount' },
      ]},
      { step: 1, type: 'returnResult', title: 'buildResponse', modules: [{ type: 'returnValue', value: '[{type:"copayment_info",amount:finalAmount}]' }] },
    ],
  },
  {
    _id: '8', type: 'collectFeedback',
    description: 'Recoleccion de feedback',
    badge: 'Starter', canBeStarter: false, pasos: 2, inputs: 3,
    createdAt: '05/09/2024 09:08', updatedAt: '10/11/2024 11:41',
    input: [
      { name: 'utterance',  type: 'String', required: true,  notes: '' },
      { name: 'sessionId',  type: 'String', required: true,  notes: '' },
      { name: 'rating',     type: 'Number', required: false, notes: '1-5' },
    ],
    workflow: [
      { step: 0, type: 'obtainValue', title: 'saveFeedback', modules: [
        { type: 'apiCall', url: 'https://api.example.com/feedback', method: 'POST', headers: [{ name: 'Content-Type', value: 'application/json' }], parameters: { sessionId: '${input.sessionId}', rating: '${input.rating}' }, outputVariableName: 'feedbackResult', outputVariableScope: 'let' },
      ]},
      { step: 1, type: 'returnResult', title: 'buildResponse', modules: [{ type: 'returnValue', value: '[{type:"feedback_saved",success:true}]' }] },
    ],
  },
]
