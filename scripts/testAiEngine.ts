import { getAllMospiProjects } from '../src/data/projectParser';
import { generateProjectIntelligenceResponse } from '../src/utils/projectAiEngine';

const projects = getAllMospiProjects();
console.log('Total loaded projects for test:', projects.length);

const testQueries = [
  'TRIVANDRUM-KANYAKUMARI DOUBLING PROJECT',
  'N22000399',
  'why is this project at risk',
  'Why is TRIVANDRUM-KANYAKUMARI DOUBLING PROJECT at risk?',
  'when did it start',
];

const activeProj = projects.find(p => p.projectCode === 'N22000399');
console.log('Using activeProject for test:', activeProj?.name, activeProj?.projectCode);

testQueries.forEach((q, idx) => {
  console.log('\n========================================');
  console.log('TEST QUERY #' + (idx + 1) + ':', q);
  const result = generateProjectIntelligenceResponse(q, projects, activeProj);
  console.log('Matched Project:', result.matchedProject ? result.matchedProject.name + ' (' + result.matchedProject.projectCode + ')' : 'None (Portfolio)');
  console.log('Intent:', result.intent);
  console.log('Source:', result.source);
  console.log('--- Response Preview ---');
  console.log(result.reply.substring(0, 350) + '...\n');
});
