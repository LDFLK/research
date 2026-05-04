export interface BoardMember {
  name: string;
  position: string;
  termStart: string;
  termEnd?: string;
}

export interface MeetingDetail {
  date: string;
  description: string;
  minutesLink?: string;
}

export interface RTITimeline {
  dateSent: string;
  dateResponded?: string;
  status: 'awaiting' | 'available' | 'withheld';
  description: string;
  response?: string;
  exemptionReason?: string;
  minutesLink?: string;
  meetingDetails?: MeetingDetail[];
}

export interface Mandate {
  section: string;
  body: string;
  description: string;
  frequency: string;
}

export interface MeetingBody {
  id: string;
  name: string;
  fullName: string;
  enablingAct: string;
  actSection?: string;
  chair: string;
  composition: string;
  mandate: Mandate[];
  frequency: {
    type: 'defined' | 'not_specified';
    interval?: string;
  };
  rtiHistory: RTITimeline[];
  boardMembers?: BoardMember[];
}

export interface Ministry {
  id: string;
  name: string;
  color: string;
  bodies: MeetingBody[];
}

export function getLatestRti(body: MeetingBody): RTITimeline {
  return body.rtiHistory[0];
}

export const ministriesData: Ministry[] = [
{
  id: 'defence',
  name: 'Ministry of Defence',
  color: '#1e40af',
  bodies: [
  {
    id: 'nsc',
    name: 'National Security Council',
    fullName: 'National Security Council of Sri Lanka',
    enablingAct: 'National Security Act No. 9/2023',
    actSection: 'Section 4',
    chair: 'President of Sri Lanka',
    composition:
    'President, Prime Minister, Minister of Defence, Chief of Defence Staff, and heads of intelligence agencies',
    frequency: {
      type: 'defined',
      interval: 'Monthly'
    },
    mandate: [
      { section: 'Section 4', body: 'National Security Act No. 9/2023', description: 'Council must convene once every month without exception.', frequency: 'Monthly' },
      { section: 'Section 4', body: 'National Security Act No. 9/2023', description: 'President, PM, Minister of Defence, CDS & all intelligence heads must attend.', frequency: 'Per meeting' },
      { section: 'Section 4', body: 'National Security Act No. 9/2023', description: 'Minutes must be recorded and retained for official reference.', frequency: 'Per meeting' },
    ],
    rtiHistory: [
    {
      dateSent: '2026-03-01',
      status: 'awaiting',
      description: "Meeting Minutes of National Security Council of Sri Lanka for February 2026 asking for response again as previous response was not in line with the RTI Act",
    },
    {
      dateSent: '2026-01-15',
      dateResponded: '2026-02-10',
      status: 'withheld',
      description: "Meeting Minutes of National Security Council of Sri Lanka for January 2026",
      response:
      'Minutes withheld under Section 5(1)(a) - national security exemption',
      exemptionReason:
      'Information classified under national security provisions',
    }]

  },
  {
    id: 'dac',
    name: 'Defence Acquisition Council',
    fullName: 'Defence Acquisition and Procurement Council',
    enablingAct: 'Defence Procurement Act No. 12/2021',
    actSection: 'Section 7',
    chair: 'Secretary, Ministry of Defence',
    composition:
    'Secretary of Defence (Chair), Financial Secretary, and service chiefs',
    frequency: {
      type: 'defined',
      interval: 'Quarterly'
    },
    mandate: [
      { section: 'Section 7', body: 'Defence Procurement Act No. 12/2021', description: 'Council must meet at least once per quarter to review procurement.', frequency: 'Quarterly' },
      { section: 'Section 7', body: 'Defence Procurement Act No. 12/2021', description: 'Secretary of Defence, Financial Secretary & all service chiefs required.', frequency: 'Per meeting' },
    ],
    rtiHistory: [
    {
      dateSent: '2026-01-20',
      status: 'awaiting',
      description: 'Meeting Minutes of Defence Acquisition and Procurement Council for December 2025 seeking response within 14 days',
    }]

  }]

},
{
  id: 'justice',
  name: 'Ministry of Justice',
  color: '#7c2d12',
  bodies: [
  {
    id: 'omp',
    name: 'Office on Missing Persons',
    fullName: 'Office on Missing Persons',
    enablingAct: 'Office on Missing Persons Act No. 14/2016',
    actSection: 'Section 3',
    chair: 'Mr. Mahesh Katulanda',
    composition: 'Seven-member board appointed by the President',
    frequency: {
      type: 'not_specified'
    },
    mandate: [
      { section: 'Section 3', body: 'Office on Missing Persons Act No. 14/2016', description: 'Board must convene regularly to fulfil its statutory mandate.', frequency: 'Regular' },
      { section: 'Section 3', body: 'Office on Missing Persons Act No. 14/2016', description: 'Minimum quorum of four of the seven board members required.', frequency: 'Per meeting' },
      { section: 'Section 5', body: 'Office on Missing Persons Act No. 14/2016', description: 'Decisions and resolutions must be recorded in official minutes.', frequency: 'Per meeting' },
    ],
    rtiHistory: [
    {
      dateSent: '2026-03-05',
      dateResponded: '2026-03-20',
      status: 'available',
      description: 'Minutes of last three meetings provided',
      response: 'Minutes of last three meetings provided',
      minutesLink: '#',
      meetingDetails: [
      { date: '18th of Feb 2026', description: '157th board meeting' },
      { date: '26th of Feb 2026', description: '158th board meeting' },
      { date: '26th of Feb 2026', description: '159th board meeting' }],
    },
    {
      dateSent: '2026-01-10',
      dateResponded: '2026-02-05',
      status: 'available',
      description: 'Partial minutes provided',
      response: 'Partial minutes provided',
      minutesLink: '#',
      meetingDetails: [
      { date: '15th of Jan 2026', description: '156th board meeting' }],
    },
    {
      dateSent: '2025-11-01',
      dateResponded: '2025-11-20',
      status: 'withheld',
      description: 'Minutes of previous board meetings',
      response: 'Minutes withheld',
      exemptionReason: 'Administrative delays in finalizing minutes',
    }]

  },
  {
    id: 'hrc',
    name: 'Human Rights Commission',
    fullName: 'Human Rights Commission of Sri Lanka',
    enablingAct: 'Human Rights Commission Act No. 21/1996',
    actSection: 'Section 2',
    chair: 'Justice Rohini Walgama',
    composition:
    'Five commissioners appointed by the President with Parliamentary approval',
    frequency: {
      type: 'defined',
      interval: 'Bi-weekly'
    },
    mandate: [
      { section: 'Section 2', body: 'Human Rights Commission Act No. 21/1996', description: 'Commission must meet bi-weekly to discharge its functions.', frequency: 'Bi-weekly' },
      { section: 'Section 2', body: 'Human Rights Commission Act No. 21/1996', description: 'All five presidentially appointed commissioners must be present.', frequency: 'Per meeting' },
    ],
    rtiHistory: [
    {
      dateSent: '2026-01-12',
      dateResponded: '2026-02-15',
      status: 'available',
      description: 'Meeting minutes provided for January 2026',
      response: 'Meeting minutes provided for January 2026',
      minutesLink: '#',
    }]

  },
  {
    id: 'lrc',
    name: 'Law Reform Commission',
    fullName: 'Law Reform Commission of Sri Lanka',
    enablingAct: 'Law Commission Act No. 1/1987',
    actSection: 'Section 3',
    chair: 'Justice K. T. Chitrasiri',
    composition: 'Chairman and four members appointed by the President',
    frequency: {
      type: 'not_specified'
    },
    mandate: [
      { section: 'Section 3', body: 'Law Commission Act No. 1/1987', description: 'Chairman and all four members must meet at regular intervals.', frequency: 'Regular' },
      { section: 'Section 6', body: 'Law Commission Act No. 1/1987', description: 'Proceedings and recommendations must be minuted and submitted.', frequency: 'Per meeting' },
    ],
    rtiHistory: [
    {
      dateSent: '2026-02-01',
      status: 'awaiting',
      description: 'Minutes of previous board meetings',
    }]

  }]

},
{
  id: 'finance',
  name: 'Ministry of Finance',
  color: '#065f46',
  bodies: [
  {
    id: 'cb-board',
    name: 'Central Bank Monetary Board',
    fullName: 'Monetary Board of the Central Bank of Sri Lanka',
    enablingAct: 'Monetary Law Act No. 58/1949',
    actSection: 'Section 9',
    chair: 'Dr. P. Nandalal Weerasinghe',
    composition:
    'Governor (Chair) and six members appointed by the Minister',
    frequency: {
      type: 'defined',
      interval: 'Weekly'
    },
    mandate: [
      { section: 'Section 9', body: 'Monetary Law Act No. 58/1949', description: 'Board must convene every week to oversee monetary policy.', frequency: 'Weekly' },
      { section: 'Section 9', body: 'Monetary Law Act No. 58/1949', description: 'Governor and all six ministerially appointed members required.', frequency: 'Per meeting' },
      { section: 'Section 11', body: 'Monetary Law Act No. 58/1949', description: 'Minutes of each meeting must be signed and filed officially.', frequency: 'Per meeting' },
    ],
    rtiHistory: [
    {
      dateSent: '2026-03-10',
      dateResponded: '2026-03-25',
      status: 'withheld',
      description: 'Minutes withheld',
      response: 'Minutes withheld under Section 5(1)(d)',
      exemptionReason: 'Ongoing policy formulation',
    },
    {
      dateSent: '2026-01-08',
      dateResponded: '2026-01-25',
      status: 'withheld',
      description: 'Minutes withheld',
      response:
      'Minutes withheld under Section 5(1)(d) - commercial confidentiality',
      exemptionReason:
      'Monetary policy deliberations contain market-sensitive information',
    }]

  },
  {
    id: 'sec',
    name: 'Securities & Exchange Commission',
    fullName: 'Securities and Exchange Commission of Sri Lanka',
    enablingAct: 'Securities and Exchange Commission Act No. 36/1987',
    actSection: 'Section 3',
    chair: 'Mr. Ranel Wijesinha',
    composition: 'Chairman and four members appointed by the Minister',
    frequency: {
      type: 'defined',
      interval: 'Monthly'
    },
    mandate: [
      { section: 'Section 3', body: 'Securities and Exchange Commission Act No. 36/1987', description: 'Commission must hold at least one meeting per month.', frequency: 'Monthly' },
      { section: 'Section 3', body: 'Securities and Exchange Commission Act No. 36/1987', description: 'Chairman and all four ministerially appointed members must attend.', frequency: 'Per meeting' },
    ],
    rtiHistory: [
    {
      dateSent: '2026-01-18',
      dateResponded: '2026-02-12',
      status: 'available',
      description: 'Minutes of December 2025 and January 2026 meetings provided',
      response:
      'Minutes of December 2025 and January 2026 meetings provided',
      minutesLink: '#',
    }]

  }]

},
{
  id: 'health',
  name: 'Ministry of Health',
  color: '#be123c',
  bodies: [
  {
    id: 'nmc',
    name: 'National Medicines Regulatory Authority',
    fullName: 'National Medicines Regulatory Authority',
    enablingAct: 'National Medicines Regulatory Authority Act No. 5/2015',
    actSection: 'Section 4',
    chair: 'Prof. Asita de Silva',
    composition:
    'Chairman and eight members with expertise in medicine, pharmacy, and public health',
    frequency: {
      type: 'defined',
      interval: 'Monthly'
    },
    mandate: [
      { section: 'Section 4', body: 'National Medicines Regulatory Authority Act No. 5/2015', description: 'Authority must convene monthly to review regulatory matters.', frequency: 'Monthly' },
      { section: 'Section 4', body: 'National Medicines Regulatory Authority Act No. 5/2015', description: 'Chairman and all eight expert members in medicine and pharmacy required.', frequency: 'Per meeting' },
    ],
    rtiHistory: [
    {
      dateSent: '2026-01-22',
      status: 'awaiting',
      description: 'Minutes of previous board meetings',
    }]

  },
  {
    id: 'slmc',
    name: 'Sri Lanka Medical Council',
    fullName: 'Sri Lanka Medical Council',
    enablingAct: 'Medical Ordinance No. 10/1927',
    actSection: 'Section 3',
    chair: 'Dr. Anver Hameed',
    composition:
    'Elected and appointed members representing medical professionals',
    frequency: {
      type: 'defined',
      interval: 'Quarterly'
    },
    mandate: [
      { section: 'Section 3', body: 'Medical Ordinance No. 10/1927', description: 'Council must convene at minimum once every quarter.', frequency: 'Quarterly' },
      { section: 'Section 3', body: 'Medical Ordinance No. 10/1927', description: 'All elected and appointed members representing the profession must attend.', frequency: 'Per meeting' },
    ],
    rtiHistory: [
    {
      dateSent: '2026-02-05',
      status: 'awaiting',
      description: 'Minutes of previous board meetings',
    }]

  },
  {
    id: 'nhsl',
    name: 'National Health Services Board',
    fullName: 'National Health Services Board',
    enablingAct: 'National Health Services Act No. 9/2018',
    actSection: 'Section 5',
    chair: 'Dr. Palitha Mahipala',
    composition:
    'Director General of Health Services (Chair) and representatives from teaching hospitals',
    frequency: {
      type: 'not_specified'
    },
    mandate: [
      { section: 'Section 5', body: 'National Health Services Act No. 9/2018', description: 'Board must meet regularly to govern national health services.', frequency: 'Regular' },
      { section: 'Section 5', body: 'National Health Services Act No. 9/2018', description: 'Director General of Health and all teaching hospital representatives required.', frequency: 'Per meeting' },
    ],
    rtiHistory: [
    {
      dateSent: '2026-01-28',
      dateResponded: '2026-02-20',
      status: 'available',
      description: 'Minutes of last two meetings provided',
      response: 'Minutes of last two meetings provided',
      minutesLink: '#',
    }]

  }]

},
{
  id: 'education',
  name: 'Ministry of Education',
  color: '#6d28d9',
  bodies: [
  {
    id: 'nie',
    name: 'National Institute of Education Council',
    fullName: 'National Institute of Education Council',
    enablingAct: 'National Institute of Education Act No. 28/1985',
    actSection: 'Section 4',
    chair: 'Prof. Kapila Perera',
    composition:
    'Director General (Chair) and members representing universities and education sector',
    frequency: {
      type: 'defined',
      interval: 'Quarterly'
    },
    mandate: [
      { section: 'Section 4', body: 'National Institute of Education Act No. 28/1985', description: 'Council must convene once every quarter.', frequency: 'Quarterly' },
      { section: 'Section 4', body: 'National Institute of Education Act No. 28/1985', description: 'Director General and all university and education sector members required.', frequency: 'Per meeting' },
    ],
    rtiHistory: [
    {
      dateSent: '2026-01-14',
      dateResponded: '2026-02-08',
      status: 'available',
      description: 'Minutes of Q4 2025 meeting provided',
      response: 'Minutes of Q4 2025 meeting provided',
      minutesLink: '#',
    }]

  },
  {
    id: 'ugc',
    name: 'University Grants Commission',
    fullName: 'University Grants Commission',
    enablingAct: 'Universities Act No. 16/1978',
    actSection: 'Section 18',
    chair: 'Prof. Sampath Amaratunge',
    composition: 'Chairman and members appointed by the President',
    frequency: {
      type: 'defined',
      interval: 'Monthly'
    },
    mandate: [
      { section: 'Section 18', body: 'Universities Act No. 16/1978', description: 'Commission must hold at least one meeting per month.', frequency: 'Monthly' },
      { section: 'Section 18', body: 'Universities Act No. 16/1978', description: 'Chairman and all presidentially appointed members must be present.', frequency: 'Per meeting' },
    ],
    rtiHistory: [
    {
      dateSent: '2026-02-03',
      status: 'awaiting',
      description: 'Minutes of previous board meetings',
    }]

  }]

},
{
  id: 'foreign',
  name: 'Ministry of Foreign Affairs',
  color: '#0e7490',
  bodies: [
  {
    id: 'fsc',
    name: 'Foreign Service Commission',
    fullName: 'Foreign Service Commission',
    enablingAct: 'Foreign Service Act No. 19/2006',
    actSection: 'Section 3',
    chair: 'Ambassador Ravinatha Aryasinha',
    composition: 'Chairman and four members with diplomatic experience',
    frequency: {
      type: 'not_specified'
    },
    mandate: [
      { section: 'Section 3', body: 'Foreign Service Act No. 19/2006', description: 'Commission must convene regularly to oversee foreign service conduct.', frequency: 'Regular' },
      { section: 'Section 3', body: 'Foreign Service Act No. 19/2006', description: 'Chairman and all four members with diplomatic experience required.', frequency: 'Per meeting' },
    ],
    rtiHistory: [
    {
      dateSent: '2026-01-25',
      dateResponded: '2026-02-18',
      status: 'withheld',
      description: 'Minutes withheld',
      response:
      'Minutes withheld under Section 5(1)(a) - international relations exemption',
      exemptionReason:
      'Discussions contain sensitive diplomatic information',
    }]

  }]

},
{
  id: 'transport',
  name: 'Ministry of Transport',
  color: '#b45309',
  bodies: [
  {
    id: 'nta',
    name: 'National Transport Authority',
    fullName: 'National Transport Commission',
    enablingAct: 'National Transport Commission Act No. 37/1991',
    actSection: 'Section 3',
    chair: 'Mr. Nilan Miranda',
    composition: 'Chairman and six members appointed by the Minister',
    frequency: {
      type: 'defined',
      interval: 'Monthly'
    },
    mandate: [
      { section: 'Section 3', body: 'National Transport Commission Act No. 37/1991', description: 'Commission must hold at least one meeting every month.', frequency: 'Monthly' },
      { section: 'Section 3', body: 'National Transport Commission Act No. 37/1991', description: 'Chairman and all six ministerially appointed members required.', frequency: 'Per meeting' },
    ],
    rtiHistory: [
    {
      dateSent: '2026-01-30',
      status: 'awaiting',
      description: 'Minutes of previous board meetings',
    }]

  },
  {
    id: 'rda',
    name: 'Road Development Authority Board',
    fullName: 'Road Development Authority Board',
    enablingAct: 'Road Development Authority Act No. 73/1981',
    actSection: 'Section 4',
    chair: 'Eng. R. W. R. Premasiri',
    composition:
    'Chairman and members representing engineering and planning sectors',
    frequency: {
      type: 'defined',
      interval: 'Bi-monthly'
    },
    mandate: [
      { section: 'Section 4', body: 'Road Development Authority Act No. 73/1981', description: 'Board must convene at least once every two months.', frequency: 'Bi-monthly' },
      { section: 'Section 4', body: 'Road Development Authority Act No. 73/1981', description: 'Chairman and all engineering and planning sector members required.', frequency: 'Per meeting' },
    ],
    rtiHistory: [
    {
      dateSent: '2026-02-02',
      dateResponded: '2026-02-22',
      status: 'available',
      description: 'Minutes of January 2026 meeting provided',
      response: 'Minutes of January 2026 meeting provided',
      minutesLink: '#',
    }]

  }]

},
{
  id: 'environment',
  name: 'Ministry of Environment',
  color: '#15803d',
  bodies: [
  {
    id: 'cea',
    name: 'Central Environmental Authority',
    fullName: 'Central Environmental Authority Board',
    enablingAct: 'National Environmental Act No. 47/1980',
    actSection: 'Section 3',
    chair: 'Dr. Anil Jasinghe',
    composition: 'Chairman and members with environmental expertise',
    frequency: {
      type: 'defined',
      interval: 'Quarterly'
    },
    mandate: [
      { section: 'Section 3', body: 'National Environmental Act No. 47/1980', description: 'Board must convene once per quarter to review environmental matters.', frequency: 'Quarterly' },
      { section: 'Section 3', body: 'National Environmental Act No. 47/1980', description: 'Chairman and all members with environmental expertise required.', frequency: 'Per meeting' },
    ],
    rtiHistory: [
    {
      dateSent: '2026-01-16',
      dateResponded: '2026-02-14',
      status: 'available',
      description: 'Minutes of Q4 2025 meeting provided',
      response: 'Minutes of Q4 2025 meeting provided',
      minutesLink: '#',
    }]

  },
  {
    id: 'fdc',
    name: 'Forest Department Council',
    fullName: 'Forest Conservation Council',
    enablingAct: 'Forest Ordinance No. 16/1907',
    actSection: 'Section 4',
    chair: 'Mr. Anura Sathurusinghe',
    composition: 'Conservator General (Chair) and regional conservators',
    frequency: {
      type: 'not_specified'
    },
    mandate: [
      { section: 'Section 4', body: 'Forest Ordinance No. 16/1907', description: 'Council must convene regularly to coordinate conservation policy.', frequency: 'Regular' },
      { section: 'Section 4', body: 'Forest Ordinance No. 16/1907', description: 'Conservator General and all regional conservators must be present.', frequency: 'Per meeting' },
    ],
    rtiHistory: [
    {
      dateSent: '2026-02-06',
      status: 'awaiting',
      description: 'Minutes of previous board meetings',
    }]

  }]

},
{
  id: 'agriculture',
  name: 'Ministry of Agriculture',
  color: '#4d7c0f',
  bodies: [
  {
    id: 'paddy',
    name: 'Paddy Marketing Board',
    fullName: 'Paddy Marketing Board',
    enablingAct: 'Paddy Marketing Board Act No. 14/1971',
    actSection: 'Section 3',
    chair: 'Mr. W. M. W. Weerakoon',
    composition: 'Chairman and members representing farmers and traders',
    frequency: {
      type: 'defined',
      interval: 'Monthly'
    },
    mandate: [
      { section: 'Section 3', body: 'Paddy Marketing Board Act No. 14/1971', description: 'Board must hold at least one meeting per month.', frequency: 'Monthly' },
      { section: 'Section 3', body: 'Paddy Marketing Board Act No. 14/1971', description: 'Chairman and all farmer and trader representatives required.', frequency: 'Per meeting' },
    ],
    rtiHistory: [
    {
      dateSent: '2026-01-19',
      dateResponded: '2026-02-11',
      status: 'available',
      description: 'Minutes of December 2025 and January 2026 provided',
      response: 'Minutes of December 2025 and January 2026 provided',
      minutesLink: '#',
    }]

  }]

},
{
  id: 'power',
  name: 'Ministry of Power & Energy',
  color: '#ca8a04',
  bodies: [
  {
    id: 'pucsl',
    name: 'Public Utilities Commission',
    fullName: 'Public Utilities Commission of Sri Lanka',
    enablingAct: 'Public Utilities Commission Act No. 35/2002',
    actSection: 'Section 3',
    chair: 'Mr. Janaka Ratnayake',
    composition:
    'Chairman and four commissioners appointed by the President',
    frequency: {
      type: 'defined',
      interval: 'Bi-weekly'
    },
    mandate: [
      { section: 'Section 3', body: 'Public Utilities Commission Act No. 35/2002', description: 'Commission must convene bi-weekly to regulate utility services.', frequency: 'Bi-weekly' },
      { section: 'Section 3', body: 'Public Utilities Commission Act No. 35/2002', description: 'Chairman and all four presidentially appointed commissioners required.', frequency: 'Per meeting' },
    ],
    rtiHistory: [
    {
      dateSent: '2026-01-21',
      status: 'awaiting',
      description: 'Minutes of previous board meetings',
    }]

  },
  {
    id: 'ceb',
    name: 'Ceylon Electricity Board',
    fullName: 'Ceylon Electricity Board',
    enablingAct: 'Ceylon Electricity Board Act No. 17/1969',
    actSection: 'Section 4',
    chair: 'Eng. Sulakshana Jayawardena',
    composition:
    'Chairman and members with engineering and financial expertise',
    frequency: {
      type: 'defined',
      interval: 'Monthly'
    },
    mandate: [
      { section: 'Section 4', body: 'Ceylon Electricity Board Act No. 17/1969', description: 'Board must hold at least one meeting per month.', frequency: 'Monthly' },
      { section: 'Section 4', body: 'Ceylon Electricity Board Act No. 17/1969', description: 'Chairman and all members with engineering and financial expertise required.', frequency: 'Per meeting' },
    ],
    rtiHistory: [
    {
      dateSent: '2026-02-04',
      dateResponded: '2026-02-25',
      status: 'available',
      description: 'Minutes of January 2026 meeting provided',
      response: 'Minutes of January 2026 meeting provided',
      minutesLink: '#',
    }]

  }]

},
{
  id: 'public-admin',
  name: 'Ministry of Public Administration',
  color: '#4338ca',
  bodies: [
  {
    id: 'psc',
    name: 'Public Service Commission',
    fullName: 'Public Service Commission',
    enablingAct: 'Constitution of Sri Lanka',
    actSection: 'Article 55',
    chair: 'Mr. D. Dissanayake',
    composition:
    'Chairman and members appointed by the President with Parliamentary approval',
    frequency: {
      type: 'defined',
      interval: 'Weekly'
    },
    mandate: [
      { section: 'Article 55', body: 'Constitution of Sri Lanka', description: 'Commission must convene every week to exercise constitutional functions.', frequency: 'Weekly' },
      { section: 'Article 55', body: 'Constitution of Sri Lanka', description: 'Chairman and all members appointed by the President (with Parliamentary approval) required.', frequency: 'Per meeting' },
      { section: 'Article 55', body: 'Constitution of Sri Lanka', description: 'All decisions must be formally recorded and communicated to relevant state bodies.', frequency: 'Per meeting' },
    ],
    rtiHistory: [
    {
      dateSent: '2026-03-01',
      dateResponded: '2026-03-15',
      status: 'available',
      description: 'Summary minutes of February meetings provided',
      response: 'Summary minutes of February meetings provided',
      minutesLink: '#',
      meetingDetails: [
      { date: '04th Feb 2026', description: 'Weekly meeting' },
      { date: '11th Feb 2026', description: 'Weekly meeting' }],
    },
    {
      dateSent: '2026-01-11',
      dateResponded: '2026-02-07',
      status: 'available',
      description: 'Summary minutes of January meetings provided',
      response: 'Summary minutes of January meetings provided',
      minutesLink: '#',
    }]

  },
  {
    id: 'npc',
    name: 'National Police Commission',
    fullName: 'National Police Commission',
    enablingAct: 'National Police Commission Act No. 1/1994',
    actSection: 'Section 2',
    chair: 'Justice Sisira de Abrew',
    composition: 'Chairman and four members appointed by the President',
    frequency: {
      type: 'defined',
      interval: 'Monthly'
    },
    mandate: [
      { section: 'Section 2', body: 'National Police Commission Act No. 1/1994', description: 'Commission must convene at least once a month.', frequency: 'Monthly' },
      { section: 'Section 2', body: 'National Police Commission Act No. 1/1994', description: 'Chairman and all four presidentially appointed members must attend.', frequency: 'Per meeting' },
    ],
    rtiHistory: [
    {
      dateSent: '2026-01-17',
      dateResponded: '2026-02-13',
      status: 'withheld',
      description: 'Minutes withheld',
      response:
      'Minutes withheld under Section 5(1)(b) - law enforcement exemption',
      exemptionReason:
      'Discussions contain sensitive police operational matters',
    }]

  }]

},
{
  id: 'tourism',
  name: 'Ministry of Tourism',
  color: '#0891b2',
  bodies: [
  {
    id: 'sltda',
    name: 'Sri Lanka Tourism Development Authority',
    fullName: 'Sri Lanka Tourism Development Authority',
    enablingAct: 'Tourism Act No. 38/2005',
    actSection: 'Section 4',
    chair: 'Mr. Chalaka Gajabahu',
    composition:
    'Chairman and members representing tourism industry stakeholders',
    frequency: {
      type: 'defined',
      interval: 'Quarterly'
    },
    mandate: [
      { section: 'Section 4', body: 'Tourism Act No. 38/2005', description: 'Authority must hold at least one meeting per quarter.', frequency: 'Quarterly' },
      { section: 'Section 4', body: 'Tourism Act No. 38/2005', description: 'Chairman and all tourism industry stakeholder members required.', frequency: 'Per meeting' },
    ],
    rtiHistory: [
    {
      dateSent: '2026-02-07',
      status: 'awaiting',
      description: 'Minutes of previous board meetings',
    }]

  }]

},
{
  id: 'trade',
  name: 'Ministry of Trade',
  color: '#0d9488',
  bodies: [
  {
    id: 'cac',
    name: 'Consumer Affairs Authority',
    fullName: 'Consumer Affairs Authority',
    enablingAct: 'Consumer Affairs Authority Act No. 9/2003',
    actSection: 'Section 3',
    chair: 'Mr. Thushan Gunawardena',
    composition:
    'Chairman and members representing consumer rights and trade',
    frequency: {
      type: 'defined',
      interval: 'Monthly'
    },
    mandate: [
      { section: 'Section 3', body: 'Consumer Affairs Authority Act No. 9/2003', description: 'Authority must meet at least once every month.', frequency: 'Monthly' },
      { section: 'Section 3', body: 'Consumer Affairs Authority Act No. 9/2003', description: 'Chairman and all consumer rights and trade members required.', frequency: 'Per meeting' },
    ],
    rtiHistory: [
    {
      dateSent: '2026-01-23',
      dateResponded: '2026-02-16',
      status: 'available',
      description: 'Minutes of December 2025 and January 2026 provided',
      response: 'Minutes of December 2025 and January 2026 provided',
      minutesLink: '#',
    }]

  }]

},
{
  id: 'labor',
  name: 'Ministry of Labour',
  color: '#9333ea',
  bodies: [
  {
    id: 'epf',
    name: 'Employees Provident Fund Board',
    fullName: 'Employees Provident Fund Board',
    enablingAct: 'Employees Provident Fund Act No. 15/1958',
    actSection: 'Section 3',
    chair: 'Mr. K. M. Mahinda Siriwardana',
    composition:
    'Commissioner (Chair) and representatives of employers and employees',
    frequency: {
      type: 'defined',
      interval: 'Quarterly'
    },
    mandate: [
      { section: 'Section 3', body: 'Employees Provident Fund Act No. 15/1958', description: 'Board must convene at least once per quarter.', frequency: 'Quarterly' },
      { section: 'Section 3', body: 'Employees Provident Fund Act No. 15/1958', description: 'Commissioner and all employer and employee representatives required.', frequency: 'Per meeting' },
    ],
    rtiHistory: [
    {
      dateSent: '2026-01-26',
      status: 'awaiting',
      description: 'Minutes of previous board meetings',
    }]

  },
  {
    id: 'labor-tribunal',
    name: 'Labour Tribunal',
    fullName: 'Labour Tribunal Administrative Board',
    enablingAct: 'Industrial Disputes Act No. 43/1950',
    actSection: 'Section 31B',
    chair: 'Justice S. Thurairaja',
    composition: 'President and members with labor law expertise',
    frequency: {
      type: 'not_specified'
    },
    mandate: [
      { section: 'Section 31B', body: 'Industrial Disputes Act No. 43/1950', description: 'Board must meet regularly to administer tribunal functions.', frequency: 'Regular' },
      { section: 'Section 31B', body: 'Industrial Disputes Act No. 43/1950', description: 'President and all members with labour law expertise must attend.', frequency: 'Per meeting' },
    ],
    rtiHistory: [
    {
      dateSent: '2026-02-08',
      status: 'awaiting',
      description: 'Minutes of previous board meetings',
    }]

  }]

},
{
  id: 'sports',
  name: 'Ministry of Sports',
  color: '#dc2626',
  bodies: [
  {
    id: 'nsc',
    name: 'National Sports Council',
    fullName: 'National Sports Council',
    enablingAct: 'Sports Act No. 25/1973',
    actSection: 'Section 3',
    chair: 'Mr. Arjuna Ranatunga',
    composition:
    'Chairman and members representing national sports associations',
    frequency: {
      type: 'defined',
      interval: 'Bi-monthly'
    },
    mandate: [
      { section: 'Section 3', body: 'Sports Act No. 25/1973', description: 'Council must convene at least once every two months.', frequency: 'Bi-monthly' },
      { section: 'Section 3', body: 'Sports Act No. 25/1973', description: 'Chairman and all national sports association members required.', frequency: 'Per meeting' },
    ],
    rtiHistory: [
    {
      dateSent: '2026-01-29',
      dateResponded: '2026-02-21',
      status: 'available',
      description: 'Minutes of December 2025 meeting provided',
      response: 'Minutes of December 2025 meeting provided',
      minutesLink: '#',
    }]

  }]

},
{
  id: 'technology',
  name: 'Ministry of Technology',
  color: '#7c3aed',
  bodies: [
  {
    id: 'icta',
    name: 'ICT Agency',
    fullName: 'Information and Communication Technology Agency',
    enablingAct: 'ICTA Act No. 19/2003',
    actSection: 'Section 4',
    chair: 'Mr. Reshan Dewapura',
    composition: 'Chairman and members with ICT expertise',
    frequency: {
      type: 'defined',
      interval: 'Monthly'
    },
    mandate: [
      { section: 'Section 4', body: 'ICTA Act No. 19/2003', description: 'Board must hold at least one meeting per month.', frequency: 'Monthly' },
      { section: 'Section 4', body: 'ICTA Act No. 19/2003', description: 'Chairman and all members with ICT expertise required.', frequency: 'Per meeting' },
    ],
    rtiHistory: [
    {
      dateSent: '2026-02-01',
      status: 'awaiting',
      description: 'Minutes of previous board meetings',
    }]

  },
  {
    id: 'trc',
    name: 'Telecommunications Regulatory Commission',
    fullName: 'Telecommunications Regulatory Commission of Sri Lanka',
    enablingAct: 'Sri Lanka Telecommunications Act No. 25/1991',
    actSection: 'Section 3',
    chair: 'Mr. Oshada Senanayake',
    composition: 'Director General (Chair) and commissioners',
    frequency: {
      type: 'defined',
      interval: 'Bi-weekly'
    },
    mandate: [
      { section: 'Section 3', body: 'Sri Lanka Telecommunications Act No. 25/1991', description: 'Commission must convene bi-weekly to regulate the sector.', frequency: 'Bi-weekly' },
      { section: 'Section 3', body: 'Sri Lanka Telecommunications Act No. 25/1991', description: 'Director General and all commissioners must be present.', frequency: 'Per meeting' },
    ],
    rtiHistory: [
    {
      dateSent: '2026-01-24',
      dateResponded: '2026-02-17',
      status: 'available',
      description: 'Minutes of January 2026 meetings provided',
      response: 'Minutes of January 2026 meetings provided',
      minutesLink: '#',
    }]

  }]

},
{
  id: 'housing',
  name: 'Ministry of Housing',
  color: '#ea580c',
  bodies: [
  {
    id: 'uhda',
    name: 'Urban Development Authority',
    fullName: 'Urban Development Authority',
    enablingAct: 'Urban Development Authority Act No. 41/1978',
    actSection: 'Section 3',
    chair: 'Eng. Priyantha Perera',
    composition: 'Chairman and members with urban planning expertise',
    frequency: {
      type: 'defined',
      interval: 'Monthly'
    },
    mandate: [
      { section: 'Section 3', body: 'Urban Development Authority Act No. 41/1978', description: 'Authority must hold at least one meeting per month.', frequency: 'Monthly' },
      { section: 'Section 3', body: 'Urban Development Authority Act No. 41/1978', description: 'Chairman and all urban planning expert members required.', frequency: 'Per meeting' },
    ],
    rtiHistory: [
    {
      dateSent: '2026-01-27',
      dateResponded: '2026-02-19',
      status: 'available',
      description: 'Minutes of January 2026 meeting provided',
      response: 'Minutes of January 2026 meeting provided',
      minutesLink: '#',
    }]

  }]

}];

export function calculateStats() {
  const totalBodies = ministriesData.reduce(
    (sum, ministry) => sum + ministry.bodies.length,
    0
  );

  const totalRtisSent = ministriesData.reduce(
    (sum, ministry) =>
      sum +
      ministry.bodies.reduce(
        (bodySum, body) =>
          bodySum + body.rtiHistory.filter((r) => r.dateSent).length,
        0
      ),
    0
  );

  const totalRtisResponded = ministriesData.reduce(
    (sum, ministry) =>
      sum +
      ministry.bodies.reduce(
        (bodySum, body) =>
          bodySum + body.rtiHistory.filter((r) => r.dateResponded).length,
        0
      ),
    0
  );

  const minutesAvailable = ministriesData.reduce(
    (sum, ministry) =>
    sum +
    ministry.bodies.filter(
      (body) => getLatestRti(body).status === 'available'
    ).length,
    0
  );

  return {
    ministries: ministriesData.length,
    totalBodies,
    totalRtisSent,
    totalRtisResponded,
    minutesAvailable
  };
}