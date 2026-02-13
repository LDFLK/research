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
          label: 'Ministry Deep Dive',
          collapsible: true,
          link: { type: 'doc', id: 'ministry-deep-dive/intro' },
          items: [
            'ministry-deep-dive/health-ministry',
            'ministry-deep-dive/meetings',
            {
              type: 'category',
              label: 'Act Lineage',
              collapsible: true,
              link: { type: 'doc', id: 'ministry-deep-dive/act-lineage/index' },
              items: [
                {
                  type: 'category',
                  label: 'Health Services Act',
                  collapsible: true,
                  items: [
                    'ministry-deep-dive/act-lineage/health-services-act/lineage',
                    'ministry-deep-dive/act-lineage/health-services-act/deep-dive',
                  ],
                },
                {
                  type: 'category',
                  label: 'Medical Ordinance',
                  collapsible: true,
                  items: [
                    'ministry-deep-dive/act-lineage/medical-ordinance/lineage',
                    'ministry-deep-dive/act-lineage/medical-ordinance/deep-dive',
                  ],
                },
                {
                  type: 'category',
                  label: 'Medical Wants Ordinance',
                  collapsible: true,
                  items: [
                    'ministry-deep-dive/act-lineage/medical-wants-ordinance/lineage',
                    'ministry-deep-dive/act-lineage/medical-wants-ordinance/deep-dive',
                  ],
                },
                {
                  type: 'category',
                  label: 'Mental Disease Ordinance',
                  collapsible: true,
                  items: [
                    'ministry-deep-dive/act-lineage/mental-disease-ordinance/lineage',
                    'ministry-deep-dive/act-lineage/mental-disease-ordinance/deep-dive',
                  ],
                },
                {
                  type: 'category',
                  label: 'National Health Dev. Fund',
                  collapsible: true,
                  items: [
                    'ministry-deep-dive/act-lineage/national-health-dev-fund/lineage',
                    'ministry-deep-dive/act-lineage/national-health-dev-fund/deep-dive',
                  ],
                },
                {
                  type: 'category',
                  label: 'Nursing Homes Act',
                  collapsible: true,
                  items: [
                    'ministry-deep-dive/act-lineage/nursing-homes-act/lineage',
                    'ministry-deep-dive/act-lineage/nursing-homes-act/deep-dive',
                  ],
                },
                {
                  type: 'category',
                  label: 'Poisons, Opium & Drugs',
                  collapsible: true,
                  items: [
                    'ministry-deep-dive/act-lineage/poisons-opium-drugs/lineage',
                    'ministry-deep-dive/act-lineage/poisons-opium-drugs/deep-dive',
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
