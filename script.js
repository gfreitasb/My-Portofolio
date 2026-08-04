const GITHUB_USER = 'gfreitasb';
const projectGrid = document.querySelector('#projectGrid');

function escapeHTML(value = '') {
  return value.replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
}

function formatDate(date) {
  return new Intl.DateTimeFormat('pt-BR', { month: 'short', year: 'numeric' }).format(new Date(date));
}

const languageIcons = {
  Java: 'devicon-java-plain colored', Python: 'devicon-python-plain colored',
  JavaScript: 'devicon-javascript-plain colored', TypeScript: 'devicon-typescript-plain colored',
  HTML: 'devicon-html5-plain colored', CSS: 'devicon-css3-plain colored',
  'C#': 'devicon-csharp-plain colored', C: 'devicon-c-plain colored',
  'C++': 'devicon-cplusplus-plain colored', PHP: 'devicon-php-plain colored',
  Kotlin: 'devicon-kotlin-plain colored', Shell: 'devicon-bash-plain',
  Dockerfile: 'devicon-docker-plain colored'
};

function languageMarkup(language) {
  const name = language || 'Código';
  const icon = languageIcons[name] || 'devicon-github-original';
  return `<span class="project-language"><i class="${icon} language-icon" aria-hidden="true"></i>${escapeHTML(name)}</span>`;
}

async function loadProjects() {
  try {
    const response = await fetch(`https://api.github.com/users/${GITHUB_USER}/repos?sort=updated&per_page=100`, { headers: { Accept: 'application/vnd.github+json' } });
    if (!response.ok) throw new Error('GitHub indisponível');
    const repos = (await response.json())
      .filter(repo => !repo.fork && !repo.archived)
      .sort((a, b) => Number(b.stargazers_count > 0) - Number(a.stargazers_count > 0) || new Date(b.pushed_at) - new Date(a.pushed_at))
      .slice(0, 6);
    if (!repos.length) throw new Error('Nenhum projeto público encontrado');
    projectGrid.innerHTML = repos.map((repo, index) => `
      <article class="project-card reveal visible">
        <div class="project-top"><span>PROJETO / ${String(index + 1).padStart(2, '0')}</span><span>PUBLIC</span></div>
        <h3>${escapeHTML(repo.name.replaceAll('-', ' '))}</h3>
        <p>${escapeHTML(repo.description || 'Projeto público disponível para consulta no GitHub.')}</p>
        <div class="project-meta">
          ${languageMarkup(repo.language)}
          <span>★ ${repo.stargazers_count}</span><span>${formatDate(repo.pushed_at)}</span>
          <a class="project-link" href="${repo.html_url}" target="_blank" rel="noreferrer" aria-label="Abrir ${escapeHTML(repo.name)} no GitHub">↗</a>
        </div>
      </article>`).join('');
  } catch (error) {
    projectGrid.innerHTML = `<article class="project-card reveal visible"><div class="project-top"><span>GITHUB</span><span>API</span></div><h3>Projetos públicos</h3><p>Não foi possível carregar os repositórios agora. Acesse o perfil para conhecer os projetos.</p><div class="project-meta"><a class="button secondary" href="https://github.com/${GITHUB_USER}?tab=repositories" target="_blank" rel="noreferrer">Abrir GitHub ↗</a></div></article>`;
  }
}

const observer = new IntersectionObserver(entries => entries.forEach(entry => {
  if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
}), { threshold: .12 });
document.querySelectorAll('.reveal').forEach(element => observer.observe(element));

const menuToggle = document.querySelector('#menuToggle');
const navLinks = document.querySelector('#navLinks');
menuToggle.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(open));
});
navLinks.addEventListener('click', event => {
  if (event.target.matches('a')) { navLinks.classList.remove('open'); menuToggle.setAttribute('aria-expanded', 'false'); }
});

window.addEventListener('scroll', () => {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  document.querySelector('#scrollBar').style.width = `${max ? (window.scrollY / max) * 100 : 0}%`;
}, { passive: true });

document.querySelector('#year').textContent = new Date().getFullYear();
loadProjects();

const backToTop = document.querySelector('#backToTop');
backToTop?.addEventListener('click', event => {
  event.preventDefault();
  window.scrollTo({
    top: 0,
    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
  });
  history.replaceState(null, '', `${location.pathname}${location.search}`);
});