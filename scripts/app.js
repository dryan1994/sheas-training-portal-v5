// scripts/app.js
(async function () {
  await supabaseClientReady();
  if (location.pathname.endsWith('dashboard.html')) {
    onDashboardLoad();
  } else {
    onLoginLoad();
  }
})();

async function onLoginLoad() {
  window.login = async function () {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    if (!email || !password) return alert('Enter email and password');
    const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) return alert(error.message);
    location.href = './dashboard.html';
  };
  window.resetPassword = async function () {
    const email = document.getElementById('email').value.trim();
    if (!email) return alert('Enter your email first');
    const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
      redirectTo: location.origin + location.pathname.replace('index.html','') + 'dashboard.html'
    });
    if (error) return alert(error.message);
    alert('Password reset email sent.');
  };
}

async function onDashboardLoad() {
  const { data: { user } } = await supabaseClient.auth.getUser();
  if (!user) return location.replace('./index.html');

  const profile = await getOrCreateManagerProfile(user);
  const name = profile?.display_name || (user.email || '').split('@')[0];
  document.getElementById('welcomeBanner').textContent = `Welcome, ${name}`;

  if (!profile?.seen_intro) document.getElementById('firstTimeIntro').style.display = 'block';
  window.dismissIntro = async function () {
    await supabaseClient.from('managers').update({ seen_intro: true }).eq('user_id', user.id);
    document.getElementById('firstTimeIntro').style.display = 'none';
  };

  await loadCourses();
  await loadFirefighters();
  await loadSessions();
  renderFirefighters();
  renderCompliance();

  window.logout = async function () { await supabaseClient.auth.signOut(); location.href='./index.html'; };
  window.createSession = createSession;
  window.assignFirefighter = assignFirefighter;
}

async function getOrCreateManagerProfile(user) {
  const { data: existing } = await supabaseClient.from('managers').select('*').eq('user_id', user.id).maybeSingle();
  if (existing) return existing;
  const display_name = (user.user_metadata && user.user_metadata.full_name) || '';
  const { data } = await supabaseClient.from('managers').insert([{
    user_id: user.id, email: user.email, display_name, role: 'manager', seen_intro: false
  }]).select().single();
  return data;
}

let COURSES=[], FIREFIGHTERS=[], SESSIONS=[], ENROLMENTS=[];

async function loadCourses() {
  const { data } = await supabaseClient.from('courses').select('*').order('priority',{ascending:true});
  COURSES = data || [];
  document.getElementById('courseSelect').innerHTML =
    COURSES.map(c=>`<option value="${c.id}">${escapeHtml(c.name)}${c.priority&&c.priority<9999?' (P'+c.priority+')':''}</option>`).join('');
}

async function loadFirefighters() {
  const { data } = await supabaseClient.from('firefighters').select('*').order('station').order('last_name');
  FIREFIGHTERS = data || [];
  document.getElementById('ffSelect').innerHTML =
    FIREFIGHTERS.map(f=>`<option value="${f.id}">${escapeHtml(f.first_name)} ${escapeHtml(f.last_name)} — ${escapeHtml(f.station||'')}</option>`).join('');
}

async function loadSessions() {
  const { data: sessions } = await supabaseClient.from('sessions').select('*').order('start_date',{ascending:false});
  SESSIONS = sessions || [];
  document.getElementById('sessionSelect').innerHTML =
    SESSIONS.map(s=>{
      const c = COURSES.find(x=>x.id===s.course_id);
      const label = `${c?c.name:'Course'} — ${s.start_date||''} to ${s.end_date||''}`;
      return `<option value="${s.id}">${escapeHtml(label)}</option>`;
    }).join('');
  const { data: enrols } = await supabaseClient.from('enrolments').select('*');
  ENROLMENTS = enrols || [];
}

function renderFirefighters() {
  const station = (document.getElementById('filterStation').value||'').toLowerCase();
  const name = (document.getElementById('filterName').value||'').toLowerCase();
  const list = FIREFIGHTERS.filter(f=>{
    const s=(f.station||'').toLowerCase();
    const n=`${(f.first_name||'').toLowerCase()} ${(f.last_name||'').toLowerCase()}`;
    return (!station || s.includes(station)) && (!name || n.includes(name));
  });
  document.getElementById('ffList').innerHTML = list.map(f=>`<div>${escapeHtml(f.first_name)} ${escapeHtml(f.last_name)} — ${escapeHtml(f.station||'')}</div>`).join('') || '<div class="muted">No results</div>';
}

async function renderCompliance() {
  const { data, error } = await supabaseClient.rpc('count_refresher_by_course');
  if (error) { document.getElementById('compliance').textContent='Compliance will populate after SQL functions run.'; return; }
  const rows = data || [];
  document.getElementById('compliance').innerHTML =
    `<table><thead><tr><th>Course</th><th>Needs Refresher</th></tr></thead><tbody>${
      rows.map(r=>`<tr><td>${escapeHtml(r.course_name)}</td><td>${r.needs}</td></tr>`).join('')
    }</tbody></table>`;
}

async function createSession() {
  const course_id = parseInt(document.getElementById('courseSelect').value,10);
  const part_name = document.getElementById('partName').value.trim()||null;
  const start_date = document.getElementById('startDate').value||null;
  const end_date = document.getElementById('endDate').value||null;
  const location = document.getElementById('location').value.trim()||null;
  const capacity = parseInt(document.getElementById('capacity').value,10)||null;
  const { error } = await supabaseClient.from('sessions').insert([{ course_id, part_name, start_date, end_date, location, capacity }]);
  document.getElementById('sessionMsg').textContent = error ? error.message : 'Saved.';
  await loadSessions();
}

async function assignFirefighter() {
  const session_id = parseInt(document.getElementById('sessionSelect').value,10);
  const firefighter_id = parseInt(document.getElementById('ffSelect').value,10);
  const { error } = await supabaseClient.from('enrolments').insert([{ firefighter_id, session_id, status:'planned' }]);
  document.getElementById('assignMsg').textContent = error ? error.message : 'Assigned.';
}

function escapeHtml(s){return (s??'').toString().replace(/[&<>"'`=\/]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;','/':'&#x2F;','`':'&#x60;','=':'&#x3D;'}[c]));}
