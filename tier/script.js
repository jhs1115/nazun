const NAMES = [
  '감성준', '힘웃사', '그그달', '레전드', '다람쥐',
  '레몬', '혜지', '영호', '꽉낄라', '파우스트',
  '천사', '황정호',
  '윈드', '망객', '브이', '실버', '민초',
  '밴치'
];

const STAT_KEYS = ['라인전', '한타', '뇌지컬', '오더', '멘탈', '충성심', '챔프폭'];
const DEFAULT_STATS = [0, 0, 0, 0, 0, 0, 0];
const TIER_POST_TABLE = 'nazun_tier_posts';
const TIER_COMMENT_TABLE = 'nazun_tier_comments';
const TIER_REACTION_TABLE = 'nazun_tier_post_reactions';
const TIER_COMMENT_REACTION_TABLE = 'nazun_tier_comment_reactions';
const ADMIN_PASSWORD = 'jhs081115jhs';
const SUPABASE_CONFIG = window.NAZUN_SUPABASE || {};
const supabaseClient = window.supabase && SUPABASE_CONFIG.url && SUPABASE_CONFIG.anonKey
  ? window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey)
  : null;

let placements = JSON.parse(localStorage.getItem('tl_data') || '{}');
let statData = JSON.parse(localStorage.getItem('tl_stats_v2') || '{}');
let selectedName = null;
let sharedTierPosts = [];
let openSharedComments = new Set();

placements = Object.fromEntries(
  Object.entries(placements).filter(([name]) => NAMES.includes(name))
);

statData = Object.fromEntries(
  Object.entries(statData).filter(([name]) => NAMES.includes(name))
);

function save() {
  localStorage.setItem('tl_data', JSON.stringify(placements));
}

function saveStats() {
  localStorage.setItem('tl_stats_v2', JSON.stringify(statData));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function getUserLabel(user) {
  return user?.user_metadata?.display_name || user?.email?.split('@')[0] || '';
}

function snapshotPlacements() {
  const result = {};
  document.querySelectorAll('[data-zone]').forEach(zone => {
    const zoneId = zone.dataset.zone;
    zone.querySelectorAll('.card').forEach(card => {
      result[card.dataset.name] = zoneId;
    });
  });
  return result;
}

function groupedTierMarkup(post) {
  const data = post.placements || {};
  return [1, 2, 3, 4, 5].map(tier => {
    const names = Object.entries(data)
      .filter(([, value]) => value === String(tier))
      .map(([name]) => name);
    return `
      <div class="shared-tier-row">
        <strong>${tier}</strong>
        <span>${names.length ? names.map(escapeHtml).join(', ') : '없음'}</span>
      </div>
    `;
  }).join('');
}

async function currentUser() {
  if (!supabaseClient) return null;
  const { data } = await supabaseClient.auth.getUser();
  return data.user || null;
}

function getStats(name) {
  if (!statData[name]) statData[name] = [...DEFAULT_STATS];
  statData[name] = STAT_KEYS.map((_, i) => Number(statData[name][i] || 0));
  return statData[name];
}

function makeCard(name) {
  const el = document.createElement('div');
  el.className = 'card';
  el.textContent = name;
  el.dataset.name = name;
  el.draggable = true;
  el.addEventListener('click', e => {
    e.stopPropagation();
    selectMember(name);
  });
  return el;
}

let dragging = null;
let ghost = null;
let ghostOX = 0, ghostOY = 0;

function setupDrag(card) {
  card.addEventListener('dragstart', e => {
    dragging = card;
    card.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', card.dataset.name);

    ghost = card.cloneNode(true);
    ghost.classList.remove('dragging');
    ghost.classList.add('drag-ghost');
    document.body.appendChild(ghost);

    const r = card.getBoundingClientRect();
    ghostOX = e.clientX - r.left;
    ghostOY = e.clientY - r.top;
    ghost.style.left = (e.clientX - ghostOX) + 'px';
    ghost.style.top  = (e.clientY - ghostOY) + 'px';
    e.dataTransfer.setDragImage(new Image(), 0, 0);
  });

  card.addEventListener('dragend', () => {
    card.classList.remove('dragging');
    dragging = null;
    if (ghost) { ghost.remove(); ghost = null; }
    updateHints();
    save();
  });
}

document.addEventListener('dragover', e => {
  e.preventDefault();
  if (ghost) {
    ghost.style.left = (e.clientX - ghostOX) + 'px';
    ghost.style.top  = (e.clientY - ghostOY) + 'px';
  }
});

function setupZone(zone) {
  zone.addEventListener('click', e => {
    if (!e.target.closest('.card')) hideStatsPanel();
  });

  zone.addEventListener('dragover', e => {
    e.preventDefault();
    zone.classList.add('drag-over');
    const row = zone.closest('.tier-row');
    if (row) row.classList.add('drag-over');
  });

  zone.addEventListener('dragleave', e => {
    if (!zone.contains(e.relatedTarget)) {
      zone.classList.remove('drag-over');
      const row = zone.closest('.tier-row');
      if (row) row.classList.remove('drag-over');
    }
  });

  zone.addEventListener('drop', e => {
    e.preventDefault();
    zone.classList.remove('drag-over');
    const row = zone.closest('.tier-row');
    if (row) row.classList.remove('drag-over');
    if (!dragging) return;

    const name = dragging.dataset.name;
    const zoneId = zone.dataset.zone;

    const cards = [...zone.querySelectorAll('.card:not(.dragging)')];
    let insertBefore = null;
    for (const c of cards) {
      const r = c.getBoundingClientRect();
      if (e.clientX < r.left + r.width / 2) { insertBefore = c; break; }
    }

    if (insertBefore) zone.insertBefore(dragging, insertBefore);
    else zone.appendChild(dragging);

    placements[name] = zoneId;
    updateHints();
    save();
  });
}

function updateHints() {
  document.querySelectorAll('[data-zone]').forEach(z => {
    let hint = z.querySelector('.empty-hint');
    const hasCards = z.querySelector('.card');
    if (!hasCards) {
      if (!hint) {
        hint = document.createElement('div');
        hint.className = 'empty-hint';
        hint.textContent = z.id === 'pool' ? '모두 배치됨' : '여기에 드래그';
        z.appendChild(hint);
      }
    } else {
      if (hint) hint.remove();
    }
  });
}

function polarPoint(center, radius, index, total) {
  const angle = -Math.PI / 2 + (Math.PI * 2 * index) / total;
  return {
    x: center + Math.cos(angle) * radius,
    y: center + Math.sin(angle) * radius
  };
}

function drawRadar(name) {
  const svg = document.getElementById('radarChart');
  const stats = getStats(name);
  const center = 130;
  const maxRadius = 82;
  const total = STAT_KEYS.length;

  svg.innerHTML = '';

  for (let level = 1; level <= 5; level++) {
    const radius = maxRadius * level / 5;
    const points = STAT_KEYS.map((_, i) => {
      const p = polarPoint(center, radius, i, total);
      return `${p.x},${p.y}`;
    }).join(' ');
    const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    polygon.setAttribute('points', points);
    polygon.setAttribute('class', 'radar-grid');
    svg.appendChild(polygon);
  }

  STAT_KEYS.forEach((label, i) => {
    const axisEnd = polarPoint(center, maxRadius, i, total);
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', center);
    line.setAttribute('y1', center);
    line.setAttribute('x2', axisEnd.x);
    line.setAttribute('y2', axisEnd.y);
    line.setAttribute('class', 'radar-axis');
    svg.appendChild(line);

    const labelPoint = polarPoint(center, maxRadius + 28, i, total);
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', labelPoint.x);
    text.setAttribute('y', labelPoint.y);
    text.setAttribute('class', 'radar-label');
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('dominant-baseline', 'middle');
    text.textContent = label;
    svg.appendChild(text);
  });

  const statPoints = stats.map((value, i) => {
    const p = polarPoint(center, maxRadius * value / 10, i, total);
    return `${p.x},${p.y}`;
  }).join(' ');

  const shape = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
  shape.setAttribute('points', statPoints);
  shape.setAttribute('class', 'radar-shape');
  svg.appendChild(shape);

  stats.forEach((value, i) => {
    const p = polarPoint(center, maxRadius * value / 10, i, total);
    const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    dot.setAttribute('cx', p.x);
    dot.setAttribute('cy', p.y);
    dot.setAttribute('r', 3.5);
    dot.setAttribute('class', 'radar-dot');
    svg.appendChild(dot);
  });
}

function renderStatControls(name) {
  const controls = document.getElementById('statControls');
  const stats = getStats(name);

  controls.innerHTML = STAT_KEYS.map((key, i) => `
    <label class="stat-row">
      <span>${key}</span>
      <select data-stat-index="${i}">
        ${Array.from({ length: 11 }, (_, value) => {
          return `<option value="${value}" ${value === stats[i] ? 'selected' : ''}>${value}</option>`;
        }).join('')}
      </select>
    </label>
  `).join('');
}

function selectMember(name) {
  selectedName = name;
  document.getElementById('statsPanel').classList.add('is-open');
  document.getElementById('selectedName').textContent = name;
  document.querySelectorAll('.card').forEach(card => {
    card.classList.toggle('selected', card.dataset.name === name);
  });
  drawRadar(name);
  renderStatControls(name);
}

function hideStatsPanel() {
  selectedName = null;
  document.getElementById('statsPanel').classList.remove('is-open');
  document.querySelectorAll('.card').forEach(card => card.classList.remove('selected'));
}

function setupStats() {
  document.getElementById('statSave').addEventListener('click', () => {
    if (!selectedName) return;
    const inputs = [...document.querySelectorAll('[data-stat-index]')];
    statData[selectedName] = inputs.map(input => {
      const value = Number(input.value);
      if (Number.isNaN(value)) return 1;
      return Math.max(1, Math.min(10, value));
    });
    saveStats();
    selectMember(selectedName);
  });
}

async function loadSharedTierPosts() {
  if (!supabaseClient) {
    renderSharedTierPosts();
    return;
  }

  const [postsResult, commentsResult, reactionsResult, commentReactionsResult] = await Promise.all([
    supabaseClient.from(TIER_POST_TABLE).select('*').order('created_at', { ascending: false }).limit(20),
    supabaseClient.from(TIER_COMMENT_TABLE).select('*').order('created_at', { ascending: true }),
    supabaseClient.from(TIER_REACTION_TABLE).select('*'),
    supabaseClient.from(TIER_COMMENT_REACTION_TABLE).select('*')
  ]);

  if (postsResult.error || commentsResult.error) {
    sharedTierPosts = [];
    renderSharedTierPosts('Supabase 티어표 테이블을 먼저 만들어야 합니다.');
    return;
  }

  const user = await currentUser();
  const reactionsByPost = new Map();
  for (const row of reactionsResult.error ? [] : reactionsResult.data || []) {
    const summary = reactionsByPost.get(row.post_id) || { agree: 0, hmm: 0, disagree: 0, myReaction: '' };
    if (row.reaction === 'agree') summary.agree += 1;
    if (row.reaction === 'hmm') summary.hmm += 1;
    if (row.reaction === 'disagree') summary.disagree += 1;
    if (user?.id && row.user_id === user.id) summary.myReaction = row.reaction;
    reactionsByPost.set(row.post_id, summary);
  }

  const reactionsByComment = new Map();
  for (const row of commentReactionsResult.error ? [] : commentReactionsResult.data || []) {
    const summary = reactionsByComment.get(row.comment_id) || { like: 0, dislike: 0, myReaction: '' };
    if (row.reaction === 'like') summary.like += 1;
    if (row.reaction === 'dislike') summary.dislike += 1;
    if (user?.id && row.user_id === user.id) summary.myReaction = row.reaction;
    reactionsByComment.set(row.comment_id, summary);
  }

  const commentsByPost = new Map();
  for (const row of commentsResult.data || []) {
    const list = commentsByPost.get(row.post_id) || [];
    list.push({
      id: row.id,
      userId: row.user_id || '',
      author: row.author || '익명',
      text: row.message || '',
      createdAt: row.created_at ? Date.parse(row.created_at) : Date.now(),
      reactions: reactionsByComment.get(row.id) || { like: 0, dislike: 0, myReaction: '' }
    });
    commentsByPost.set(row.post_id, list);
  }

  sharedTierPosts = (postsResult.data || []).map(row => ({
    id: row.id,
    userId: row.user_id || '',
    author: row.author || '익명',
    note: row.note || '',
    placements: row.placements || {},
    stats: row.stats || {},
    createdAt: row.created_at ? Date.parse(row.created_at) : Date.now(),
    comments: commentsByPost.get(row.id) || [],
    reactions: reactionsByPost.get(row.id) || { agree: 0, hmm: 0, disagree: 0, myReaction: '' }
  }));
  renderSharedTierPosts();
}

function renderSharedTierPosts(message = '') {
  const list = document.getElementById('sharedTierList');
  if (message) {
    list.innerHTML = `<div class="share-empty">${escapeHtml(message)}</div>`;
    return;
  }
  if (!sharedTierPosts.length) {
    list.innerHTML = `<div class="share-empty">아직 올라온 티어리스트가 없습니다.</div>`;
    return;
  }

  list.innerHTML = sharedTierPosts.map((post, index) => {
    const open = openSharedComments.has(post.id);
    return `
      <article class="shared-tier-card">
        <div class="shared-tier-top">
          <div>
            <strong>${escapeHtml(post.author)}</strong>
            <small>${new Date(post.createdAt).toLocaleString('ko-KR')}</small>
          </div>
          <div class="shared-tier-actions">
            <button class="tier-comment-toggle" type="button" data-tier-comments="${index}">${open ? '접기' : `댓글 ${post.comments.length}`}</button>
            <button class="comment-delete" type="button" data-delete-tier-post="${index}">삭제</button>
          </div>
        </div>
        <p class="shared-tier-note">${escapeHtml(post.note || '멘트 없음')}</p>
        <div class="tier-reactions">
          <button class="tier-reaction-button ${post.reactions?.myReaction === 'agree' ? 'active' : ''}" type="button" data-tier-reaction="${index}:agree">ㅇㅈ ${post.reactions?.agree || 0}</button>
          <button class="tier-reaction-button ${post.reactions?.myReaction === 'hmm' ? 'active' : ''}" type="button" data-tier-reaction="${index}:hmm">흠 ${post.reactions?.hmm || 0}</button>
          <button class="tier-reaction-button ${post.reactions?.myReaction === 'disagree' ? 'active' : ''}" type="button" data-tier-reaction="${index}:disagree">ㄴㅇㅈ ${post.reactions?.disagree || 0}</button>
        </div>
        <div class="shared-tier-board">${groupedTierMarkup(post)}</div>
        ${
          open
            ? `
              <div class="tier-comments-panel">
                <div class="tier-comment-list">
                  ${
                    post.comments.length
                      ? post.comments.map(comment => `
                          <article class="tier-comment-item">
                            <div class="comment-top">
                              <strong>${escapeHtml(comment.author)}</strong>
                              <button class="comment-delete" type="button" data-delete-tier-comment="${index}:${escapeHtml(comment.id)}">삭제</button>
                            </div>
                            <p>${escapeHtml(comment.text)}</p>
                            <div class="tier-comment-reactions">
                              <button class="tier-comment-reaction-button ${comment.reactions?.myReaction === 'like' ? 'active' : ''}" type="button" data-tier-comment-reaction="${index}:${escapeHtml(comment.id)}:like">좋아요 ${comment.reactions?.like || 0}</button>
                              <button class="tier-comment-reaction-button ${comment.reactions?.myReaction === 'dislike' ? 'active' : ''}" type="button" data-tier-comment-reaction="${index}:${escapeHtml(comment.id)}:dislike">싫어요 ${comment.reactions?.dislike || 0}</button>
                            </div>
                          </article>
                        `).join('')
                      : `<div class="share-empty">댓글이 없습니다.</div>`
                  }
                </div>
                <form class="tier-comment-form" data-tier-comment-form="${index}">
                  <input name="comment" maxlength="160" placeholder="댓글 입력" autocomplete="off" />
                  <button type="submit">등록</button>
                </form>
              </div>
            `
            : ''
        }
      </article>
    `;
  }).join('');
}

async function publishTierList() {
  if (!supabaseClient) {
    alert('Supabase 설정을 찾지 못했습니다.');
    return;
  }
  const user = await currentUser();
  if (!user) {
    alert('로그인 후 올릴 수 있습니다.');
    return;
  }

  const note = document.getElementById('tierNoteInput').value.trim();
  const post = {
    id: `tier-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    user_id: user.id,
    author: getUserLabel(user),
    note,
    placements: snapshotPlacements(),
    stats: statData,
    created_at: new Date().toISOString()
  };
  const { error } = await supabaseClient.from(TIER_POST_TABLE).insert(post);
  if (error) {
    alert('티어리스트 업로드에 실패했습니다. Supabase 테이블을 확인하세요.');
    return;
  }
  document.getElementById('tierNoteInput').value = '';
  await loadSharedTierPosts();
}

async function submitTierComment(index, text) {
  if (!supabaseClient) return;
  const user = await currentUser();
  if (!user) {
    alert('로그인 후 댓글을 쓸 수 있습니다.');
    return;
  }
  const post = sharedTierPosts[index];
  if (!post || !text) return;
  const { error } = await supabaseClient.from(TIER_COMMENT_TABLE).insert({
    id: `tier-comment-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    post_id: post.id,
    user_id: user.id,
    author: getUserLabel(user),
    message: text,
    created_at: new Date().toISOString()
  });
  if (error) {
    alert('댓글 저장에 실패했습니다.');
    return;
  }
  openSharedComments.add(post.id);
  await loadSharedTierPosts();
}

async function deleteTierComment(index, commentId) {
  const post = sharedTierPosts[index];
  if (!post) return;
  const user = await currentUser();
  const comment = (post.comments || []).find(item => item.id === commentId);
  const isOwner = Boolean(user?.id && comment?.userId === user.id);
  if (!isOwner) {
    const password = prompt('관리자 비밀번호를 입력하세요.');
    if (password !== ADMIN_PASSWORD) {
      alert('비밀번호가 맞지 않습니다.');
      return;
    }
  }
  const { error } = await supabaseClient.from(TIER_COMMENT_TABLE).delete().eq('id', commentId);
  if (error) {
    alert('댓글 삭제에 실패했습니다.');
    return;
  }
  openSharedComments.add(post.id);
  await loadSharedTierPosts();
}

async function deleteTierPost(index) {
  const post = sharedTierPosts[index];
  if (!post || !supabaseClient) return;
  const user = await currentUser();
  const isOwner = Boolean(user?.id && post.userId === user.id);
  if (!isOwner) {
    const password = prompt('관리자 비밀번호를 입력하세요.');
    if (password !== ADMIN_PASSWORD) {
      alert('비밀번호가 맞지 않습니다.');
      return;
    }
  }
  const { error } = await supabaseClient.from(TIER_POST_TABLE).delete().eq('id', post.id);
  if (error) {
    alert('티어리스트 삭제에 실패했습니다.');
    return;
  }
  openSharedComments.delete(post.id);
  await loadSharedTierPosts();
}

async function toggleTierReaction(index, reaction) {
  if (!supabaseClient) return;
  const user = await currentUser();
  if (!user) {
    alert('로그인 후 반응을 남길 수 있습니다.');
    return;
  }

  const post = sharedTierPosts[index];
  if (!post) return;
  const currentReaction = post.reactions?.myReaction || '';

  if (currentReaction === reaction) {
    const { error } = await supabaseClient
      .from(TIER_REACTION_TABLE)
      .delete()
      .eq('post_id', post.id)
      .eq('user_id', user.id);
    if (error) {
      alert('반응 취소에 실패했습니다. Supabase 테이블을 확인하세요.');
      return;
    }
  } else {
    const { error } = await supabaseClient
      .from(TIER_REACTION_TABLE)
      .upsert(
        {
          post_id: post.id,
          user_id: user.id,
          reaction,
          created_at: new Date().toISOString()
        },
        { onConflict: 'post_id,user_id' }
      );
    if (error) {
      alert('반응 저장에 실패했습니다. Supabase 테이블을 확인하세요.');
      return;
    }
  }

  await loadSharedTierPosts();
}

async function toggleTierCommentReaction(index, commentId, reaction) {
  if (!supabaseClient) return;
  const user = await currentUser();
  if (!user) {
    alert('로그인 후 반응을 남길 수 있습니다.');
    return;
  }

  const post = sharedTierPosts[index];
  const comment = (post?.comments || []).find(item => item.id === commentId);
  if (!comment) return;
  const currentReaction = comment.reactions?.myReaction || '';

  if (currentReaction === reaction) {
    const { error } = await supabaseClient
      .from(TIER_COMMENT_REACTION_TABLE)
      .delete()
      .eq('comment_id', commentId)
      .eq('user_id', user.id);
    if (error) {
      alert('반응 취소에 실패했습니다. Supabase 테이블을 확인하세요.');
      return;
    }
  } else {
    const { error } = await supabaseClient
      .from(TIER_COMMENT_REACTION_TABLE)
      .upsert(
        {
          comment_id: commentId,
          user_id: user.id,
          reaction,
          created_at: new Date().toISOString()
        },
        { onConflict: 'comment_id,user_id' }
      );
    if (error) {
      alert('반응 저장에 실패했습니다. Supabase 테이블을 확인하세요.');
      return;
    }
  }

  openSharedComments.add(post.id);
  await loadSharedTierPosts();
}

function init() {
  const pool = document.getElementById('pool');
  NAMES.forEach(name => {
    const card = makeCard(name);
    setupDrag(card);
    const zone = placements[name];
    if (zone && zone !== 'pool') {
      const target = document.querySelector(`[data-zone="${zone}"]`);
      if (target) { target.appendChild(card); return; }
    }
    pool.appendChild(card);
  });

  document.querySelectorAll('[data-zone]').forEach(setupZone);
  setupStats();
  document.addEventListener('click', e => {
    if (!e.target.closest('.stats-panel') && !e.target.closest('.card')) hideStatsPanel();
  });
  document.getElementById('tierResetButton').addEventListener('click', () => {
    placements = {};
    statData = {};
    localStorage.removeItem('tl_data');
    localStorage.removeItem('tl_stats_v2');
    selectedName = null;
    document.querySelectorAll('.card').forEach(card => card.remove());
    NAMES.forEach(name => {
      const card = makeCard(name);
      setupDrag(card);
      pool.appendChild(card);
    });
    hideStatsPanel();
    updateHints();
  });
  document.getElementById('publishTierButton').addEventListener('click', publishTierList);
  document.getElementById('sharedTierList').addEventListener('click', event => {
    const reactionButton = event.target.closest('[data-tier-reaction]');
    if (reactionButton) {
      const [index, reaction] = reactionButton.dataset.tierReaction.split(':');
      toggleTierReaction(Number(index), reaction);
      return;
    }

    const commentReactionButton = event.target.closest('[data-tier-comment-reaction]');
    if (commentReactionButton) {
      const [index, commentId, reaction] = commentReactionButton.dataset.tierCommentReaction.split(':');
      toggleTierCommentReaction(Number(index), commentId, reaction);
      return;
    }

    const toggle = event.target.closest('[data-tier-comments]');
    if (toggle) {
      const post = sharedTierPosts[Number(toggle.dataset.tierComments)];
      if (!post) return;
      if (openSharedComments.has(post.id)) openSharedComments.delete(post.id);
      else openSharedComments.add(post.id);
      renderSharedTierPosts();
      return;
    }
    const deleteButton = event.target.closest('[data-delete-tier-comment]');
    if (deleteButton) {
      const [index, commentId] = deleteButton.dataset.deleteTierComment.split(':');
      deleteTierComment(Number(index), commentId);
      return;
    }
    const deletePostButton = event.target.closest('[data-delete-tier-post]');
    if (deletePostButton) {
      deleteTierPost(Number(deletePostButton.dataset.deleteTierPost));
    }
  });
  document.getElementById('sharedTierList').addEventListener('submit', event => {
    const form = event.target.closest('[data-tier-comment-form]');
    if (!form) return;
    event.preventDefault();
    const input = form.elements.comment;
    const text = input.value.trim();
    input.value = '';
    submitTierComment(Number(form.dataset.tierCommentForm), text);
  });
  hideStatsPanel();
  updateHints();
  loadSharedTierPosts();
  if (supabaseClient) {
    supabaseClient
      .channel('nazun-tier-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: TIER_POST_TABLE }, () => loadSharedTierPosts())
      .on('postgres_changes', { event: '*', schema: 'public', table: TIER_COMMENT_TABLE }, () => loadSharedTierPosts())
      .on('postgres_changes', { event: '*', schema: 'public', table: TIER_REACTION_TABLE }, () => loadSharedTierPosts())
      .on('postgres_changes', { event: '*', schema: 'public', table: TIER_COMMENT_REACTION_TABLE }, () => loadSharedTierPosts())
      .subscribe();
  }
}

init();
