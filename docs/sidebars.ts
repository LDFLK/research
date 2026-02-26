import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  tutorialSidebar: [
    'intro',
    {
      type: 'category',
      label: 'Legislative Analysis',
      collapsible: true,
      link: { type: 'doc', id: 'legislative-analysis/intro' },
      items: [
        'legislative-analysis/features',
        'legislative-analysis/architecture',
        'legislative-analysis/tech-stack',
        'legislative-analysis/ui-tool',
        'legislative-analysis/setup-usage',
        {
          type: 'category',
          label: 'Browse Acts',
          collapsible: true,
          items: [
            'legislative-analysis/acts-browser',
            'legislative-analysis/archive',
          ]
        },
        {
          type: 'category',
          label: 'Act Summaries',
          collapsible: true,
          link: { type: 'doc', id: 'act-summaries/index' },
          items: ['act-summaries/telecom-act'],
        },
        {
          type: 'doc',
          id: 'act-explorer/index',
          label: 'Act Explorer',
        },
        {
          type: 'category',
          label: 'Governance Scorecard',
          collapsible: true,
          link: { type: 'doc', id: 'governance-scorecard/index' },
          items: ['governance-scorecard/methodology', 'governance-scorecard/audit'],
        },
        {
          type: 'category',
          label: 'Ministry Deep Dive',
          collapsible: true,
          link: { type: 'doc', id: 'ministry-deep-dive/intro' },
          items: [
            {
              type: 'category',
              label: 'Health Ministry',
              collapsible: true,
              link: { type: 'doc', id: 'ministry-deep-dive/health/health-ministry' },
              items: [
                'ministry-deep-dive/health/meetings',
                {
                  type: 'category',
                  label: 'Act Lineage',
                  collapsible: true,
                  link: { type: 'doc', id: 'ministry-deep-dive/health/act-lineage/index' },
                  items: [
                    {
                      type: 'category',
                      label: 'Ayurveda Act',
                      collapsible: true,
                      items: [
                        'ministry-deep-dive/health/act-lineage/ayurveda/lineage',
                        'ministry-deep-dive/health/act-lineage/ayurveda/deep-dive',
                      ],
                    },
                    {
                      type: 'category',
                      label: 'Food Act',
                      collapsible: true,
                      items: [
                        'ministry-deep-dive/health/act-lineage/food-act/lineage',
                        'ministry-deep-dive/health/act-lineage/food-act/deep-dive',
                      ],
                    },
                    {
                      type: 'category',
                      label: 'Health Services Act',
                      collapsible: true,
                      items: [
                        'ministry-deep-dive/health/act-lineage/health-services-act/lineage',
                        'ministry-deep-dive/health/act-lineage/health-services-act/deep-dive',
                      ],
                    },
                    {
                      type: 'category',
                      label: 'Homoeopathy Act',
                      collapsible: true,
                      items: [
                        'ministry-deep-dive/health/act-lineage/homoeopathy/lineage',
                        'ministry-deep-dive/health/act-lineage/homoeopathy/deep-dive',
                      ],
                    },
                    {
                      type: 'category',
                      label: 'Medical Ordinance',
                      collapsible: true,
                      items: [
                        'ministry-deep-dive/health/act-lineage/medical-ordinance/lineage',
                        'ministry-deep-dive/health/act-lineage/medical-ordinance/deep-dive',
                      ],
                    },
                    {
                      type: 'category',
                      label: 'Medical Wants Ordinance',
                      collapsible: true,
                      items: [
                        'ministry-deep-dive/health/act-lineage/medical-wants-ordinance/lineage',
                        'ministry-deep-dive/health/act-lineage/medical-wants-ordinance/deep-dive',
                      ],
                    },
                    {
                      type: 'category',
                      label: 'Mental Disease Ordinance',
                      collapsible: true,
                      items: [
                        'ministry-deep-dive/health/act-lineage/mental-disease-ordinance/lineage',
                        'ministry-deep-dive/health/act-lineage/mental-disease-ordinance/deep-dive',
                      ],
                    },
                    {
                      type: 'category',
                      label: 'NATA (Tobacco & Alcohol)',
                      collapsible: true,
                      items: [
                        'ministry-deep-dive/health/act-lineage/nata/lineage',
                        'ministry-deep-dive/health/act-lineage/nata/deep-dive',
                      ],
                    },
                    {
                      type: 'category',
                      label: 'National Health Dev. Fund',
                      collapsible: true,
                      items: [
                        'ministry-deep-dive/health/act-lineage/national-health-dev-fund/lineage',
                        'ministry-deep-dive/health/act-lineage/national-health-dev-fund/deep-dive',
                      ],
                    },
                    {
                      type: 'category',
                      label: 'NMRA (Medicines Regulatory)',
                      collapsible: true,
                      items: [
                        'ministry-deep-dive/health/act-lineage/nmra/lineage',
                        'ministry-deep-dive/health/act-lineage/nmra/deep-dive',
                      ],
                    },
                    {
                      type: 'category',
                      label: 'Nursing Homes Act',
                      collapsible: true,
                      items: [
                        'ministry-deep-dive/health/act-lineage/nursing-homes-act/lineage',
                        'ministry-deep-dive/health/act-lineage/nursing-homes-act/deep-dive',
                      ],
                    },
                    {
                      type: 'category',
                      label: 'Private Medical Institutions',
                      collapsible: true,
                      items: [
                        'ministry-deep-dive/health/act-lineage/private-medical-inst/lineage',
                        'ministry-deep-dive/health/act-lineage/private-medical-inst/deep-dive',
                      ],
                    },
                    {
                      type: 'category',
                      label: "Nurses' Council Act",
                      collapsible: true,
                      items: [
                        'ministry-deep-dive/health/act-lineage/nurses-council/lineage',
                        'ministry-deep-dive/health/act-lineage/nurses-council/deep-dive',
                      ],
                    },
                    {
                      type: 'category',
                      label: 'Poisons, Opium & Drugs',
                      collapsible: true,
                      items: [
                        'ministry-deep-dive/health/act-lineage/poisons-opium-drugs/lineage',
                        'ministry-deep-dive/health/act-lineage/poisons-opium-drugs/deep-dive',
                      ],
                    },
                    {
                      type: 'category',
                      label: 'SJGH Board Act',
                      collapsible: true,
                      items: [
                        'ministry-deep-dive/health/act-lineage/sjgh-board/lineage',
                        'ministry-deep-dive/health/act-lineage/sjgh-board/deep-dive',
                      ],
                    },
                    {
                      type: 'category',
                      label: '1990 Suwaseriya Foundation',
                      collapsible: true,
                      items: [
                        'ministry-deep-dive/health/act-lineage/suwaseriya/lineage',
                        'ministry-deep-dive/health/act-lineage/suwaseriya/deep-dive',
                      ],
                    },
                    {
                      type: 'category',
                      label: 'Transplantation of Human Tissues',
                      collapsible: true,
                      items: [
                        'ministry-deep-dive/health/act-lineage/transplantation-tissues/lineage',
                        'ministry-deep-dive/health/act-lineage/transplantation-tissues/deep-dive',
                      ],
                    },
                    {
                      type: 'category',
                      label: 'VK Memorial Hospital Board',
                      collapsible: true,
                      items: [
                        'ministry-deep-dive/health/act-lineage/vk-memorial-hospital/lineage',
                        'ministry-deep-dive/health/act-lineage/vk-memorial-hospital/deep-dive',
                      ],
                    },
                  ],
                },
              ],
            },
            {
              type: 'category',
              label: 'Education Ministry',
              collapsible: true,
              link: { type: 'doc', id: 'ministry-deep-dive/education/education-ministry' },
              items: [
                'ministry-deep-dive/education/meetings',
                {
                  type: 'category',
                  label: 'Act Lineage',
                  collapsible: true,
                  link: { type: 'doc', id: 'ministry-deep-dive/education/act-lineage/index' },
                  items: [
                    {
                      type: 'category',
                      label: 'Assisted Schools Act',
                      collapsible: true,
                      items: [
                        'ministry-deep-dive/education/act-lineage/assisted-schools-act/lineage',
                        'ministry-deep-dive/education/act-lineage/assisted-schools-act/deep-dive',
                      ],
                    },
                    {
                      type: 'category',
                      label: 'National Library Act',
                      collapsible: true,
                      items: [
                        'ministry-deep-dive/education/act-lineage/national-library-act/lineage',
                        'ministry-deep-dive/education/act-lineage/national-library-act/deep-dive',
                      ],
                    },
                    {
                      type: 'category',
                      label: 'Public Examinations Act',
                      collapsible: true,
                      items: [
                        'ministry-deep-dive/education/act-lineage/public-examinations-act/lineage',
                        'ministry-deep-dive/education/act-lineage/public-examinations-act/deep-dive',
                      ],
                    },
                    {
                      type: 'category',
                      label: 'School Development Boards Act',
                      collapsible: true,
                      items: [
                        'ministry-deep-dive/education/act-lineage/school-development-boards-act/lineage',
                        'ministry-deep-dive/education/act-lineage/school-development-boards-act/deep-dive',
                      ],
                    },
                    {
                      type: 'category',
                      label: 'UNESCO Scholarship Fund Act',
                      collapsible: true,
                      items: [
                        'ministry-deep-dive/education/act-lineage/unesco-scholarship-fund-act/lineage',
                        'ministry-deep-dive/education/act-lineage/unesco-scholarship-fund-act/deep-dive',
                      ],
                    },
                    {
                      type: 'category',
                      label: 'State Printing Corporation Act',
                      collapsible: true,
                      items: [
                        'ministry-deep-dive/education/act-lineage/state-printing-corporation-act/lineage',
                        'ministry-deep-dive/education/act-lineage/state-printing-corporation-act/deep-dive',
                      ],
                    },
                    {
                      type: 'category',
                      label: 'Education Ordinance',
                      collapsible: true,
                      items: [
                        'ministry-deep-dive/education/act-lineage/education-ordinance/lineage',
                        'ministry-deep-dive/education/act-lineage/education-ordinance/deep-dive',
                      ],
                    },
                  ],
                },
              ],
            },
            'ministry-deep-dive/data-model',
          ]
        },
      ]
    },
    {
      type: 'category',
      label: 'DeepSeek OCR',
      collapsible: true,
      link: { type: 'doc', id: 'deepseek-ocr/intro' },
      items: [
        'deepseek-ocr/setup',
        'deepseek-ocr/usage',
        'deepseek-ocr/experiments',
      ]
    },
    {
      type: 'category',
      label: 'Gazette Analysis',
      collapsible: true,
      link: { type: 'doc', id: 'gazettes/intro' },
      items: [
        'gazettes/extractor',
        'gazettes/processor',
        'gazettes/api-reference',
        'gazettes/tracer',
      ]
    },
    {
      type: 'category',
      label: 'AuthData Audit',
      collapsible: true,
      link: { type: 'doc', id: 'authdata/intro' },
      items: [
        'authdata/architecture',
        'authdata/configuration',
        'authdata/cli-reference',
        'authdata/dashboard',
        'authdata/extending',
        'authdata/sample-results',
      ]
    },
    {
      type: 'category',
      label: 'SL Admin Service',
      collapsible: true,
      link: { type: 'doc', id: 'slas-admin/intro' },
      items: ['slas-admin/people-finder', 'slas-admin/special-grade', 'slas-admin/grade-i', 'slas-admin/grade-ii', 'slas-admin/grade-iii', 'slas-admin/post-classification', 'slas-admin/demographics', 'slas-admin/promotion-analysis', 'slas-admin/ministry-analysis'],
    },
    {
      type: 'category',
      label: 'OpenGIN-X',
      collapsible: true,
      link: { type: 'doc', id: 'opengin-x/intro' },
      items: [
        'opengin-x/features',
        'opengin-x/configuration',
        'opengin-x/usage',
      ]
    },
  ],
};

export default sidebars;
