import { readFile } from 'node:fs/promises';
const template = await readFile(new URL('./templates/site-header.html', import.meta.url), 'utf8');

export const navigation = [
  {id: 'home', label: '首页', href: './index.html'},
  {id: 'updates', label: '赛季更新', href: './updates.html'},
  {id: 'damnation', label: '服务器设定', href: './damnation.html'},
  {id: 'ascendancies', label: '升华职业', href: './ascendancies.html'},
  {id: 'mapping', label: '刷图系统', href: './mapping.html'},
  {id: 'kiln', label: '炼狱熔炉', href: './kiln.html'},
  {id: 'ladder', label: '天梯与构筑', href: 'https://bd.wdjwxh.com/'}
];

export function renderHeader(current) {
  const links = navigation.map(item => `<a href="${item.href}"${item.id === current ? ' aria-current="page"' : ''}>${item.label}</a>`).join('');
  return '<!-- site-header:start -->\n' + template.replace('{{PRIMARY_NAV}}', `<nav class="sg-main-nav" id="main-nav" aria-label="主导航">${links}</nav>`) + '\n<!-- site-header:end -->';
}
