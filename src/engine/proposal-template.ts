// Proposal Content Types and Section Templates

export interface ProposalSection {
  id: string;
  title: string;
  content: string;
}

export interface ProposalContent {
  customerName: string;
  generatedAt: string;
  sections: {
    executiveSummary: ProposalSection;
    painPoints: ProposalSection;
    solution: ProposalSection;
    pricing: ProposalSection;
    roi: ProposalSection;
    timeline: ProposalSection;
  };
}

export interface SectionTemplate {
  id: string;
  title: string;
  description: string;
  promptGuidance: string;
}

export const PROPOSAL_SECTION_TEMPLATES: SectionTemplate[] = [
  {
    id: 'executiveSummary',
    title: 'Executive Summary',
    description: '고객의 핵심 과제와 제안 솔루션의 가치를 간결하게 요약',
    promptGuidance: '고객사명, 업종, 핵심 과제 1-2개, 제안 솔루션의 핵심 가치를 2-3문장으로 요약. 구체적 수치(예상 ROI, 도입 기간)를 포함.',
  },
  {
    id: 'painPoints',
    title: 'Pain Points & Challenges',
    description: '고객이 직면한 문제점과 비즈니스 영향 분석',
    promptGuidance: '고객이 제시한 painPoints를 기반으로, 각 문제가 비즈니스에 미치는 영향을 구체적으로 서술. 업종 특성을 반영.',
  },
  {
    id: 'solution',
    title: 'Proposed Solution',
    description: '제안하는 제품/서비스와 고객 문제 해결 방안',
    promptGuidance: '카탈로그의 제품 정보만 사용. 각 제품이 어떻게 painPoints를 해결하는지 매핑. 제품의 features를 고객 맥락에 맞게 설명.',
  },
  {
    id: 'pricing',
    title: 'Pricing & Quote',
    description: '제품별 가격, 할인, 총 견적 금액',
    promptGuidance: '카탈로그의 실제 가격 데이터만 사용. base + perUser 계산식을 명시. 적용 가능한 할인 티어를 표시. 과거 유사 딜의 할인율 참조.',
  },
  {
    id: 'roi',
    title: 'ROI Analysis',
    description: '투자 대비 기대 효과 분석',
    promptGuidance: '과거 유사 딜의 성사 요인(winFactors)을 참조하여 기대 효과 산출. 업종별 벤치마크 데이터가 있으면 활용. 보수적 추정치 사용.',
  },
  {
    id: 'timeline',
    title: 'Implementation Timeline',
    description: '도입 일정 및 마일스톤',
    promptGuidance: '고객이 요청한 timeline을 기준으로 단계별 일정 제시. 일반적인 도입 단계: 킥오프 → 설정 → 데이터 이관 → 교육 → 고도화.',
  },
];

export function createEmptyProposalContent(customerName: string): ProposalContent {
  return {
    customerName,
    generatedAt: new Date().toISOString(),
    sections: {
      executiveSummary: { id: 'executiveSummary', title: 'Executive Summary', content: '' },
      painPoints: { id: 'painPoints', title: 'Pain Points & Challenges', content: '' },
      solution: { id: 'solution', title: 'Proposed Solution', content: '' },
      pricing: { id: 'pricing', title: 'Pricing & Quote', content: '' },
      roi: { id: 'roi', title: 'ROI Analysis', content: '' },
      timeline: { id: 'timeline', title: 'Implementation Timeline', content: '' },
    },
  };
}

export function proposalContentToMarkdown(proposal: ProposalContent): string {
  const sections = proposal.sections;
  const lines: string[] = [
    `# ${proposal.customerName} - Sales Proposal`,
    '',
    `> Generated: ${proposal.generatedAt}`,
    '',
  ];

  const sectionOrder: (keyof ProposalContent['sections'])[] = [
    'executiveSummary',
    'painPoints',
    'solution',
    'pricing',
    'roi',
    'timeline',
  ];

  for (let i = 0; i < sectionOrder.length; i++) {
    const section = sections[sectionOrder[i]];
    lines.push(`## ${section.title}`, '', section.content, '');
    // Add card break between sections for Gamma cardSplit: 'inputTextBreaks'
    if (i < sectionOrder.length - 1) {
      lines.push('---', '');
    }
  }

  return lines.join('\n');
}
