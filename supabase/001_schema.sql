-- Dutch fluency app: Phase 1 schema (Supabase / PostgreSQL)

create extension if not exists "pgcrypto";

-- ===== Learner =====
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  native_language text,
  current_level text not null default 'B1' check (current_level in ('B1','B1+','B2','B2+','C1','C1+','C2')),
  daily_minutes int not null default 90 check (daily_minutes in (30,60,90,120)),
  goals text,
  dark_mode boolean not null default false,
  onboarding_done boolean not null default false,
  created_at timestamptz not null default now()
);

-- ===== Curriculum (shared content) =====
create table levels (
  code text primary key,
  position int not null unique,
  objectives jsonb not null default '[]'
);

create table modules (
  id uuid primary key default gen_random_uuid(),
  level_code text not null references levels(code),
  position int not null,
  title text not null,
  description text,
  unique (level_code, position)
);

create table units (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references modules(id) on delete cascade,
  position int not null,
  title text not null,
  unique (module_id, position)
);

create table lessons (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references units(id) on delete cascade,
  position int not null,
  title text not null,
  kind text not null check (kind in ('input','listening','grammar','vocabulary','speaking','reading','writing','revision','assessment')),
  body jsonb not null,
  est_minutes int not null default 10,
  unique (unit_id, position)
);

create table exercises (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid references lessons(id) on delete cascade,
  type text not null check (type in ('multiple_choice','gap_fill','dictation','minimal_pair','reorder','translate','free_response')),
  prompt jsonb not null,
  answer jsonb not null,
  grammar_tag text,
  difficulty int not null default 1
);

create table texts (
  id uuid primary key default gen_random_uuid(),
  level_code text not null references levels(code),
  genre text not null,
  title text not null,
  content text not null,
  register text not null default 'standard' check (register in ('informal','standard','formal')),
  questions jsonb not null default '[]'
);

create table audio_assets (
  id uuid primary key default gen_random_uuid(),
  text_id uuid references texts(id) on delete cascade,
  lesson_id uuid references lessons(id) on delete cascade,
  speaker text not null,
  speed text not null default 'normal',
  storage_path text not null,
  transcript jsonb not null default '[]'
);

-- ===== Vocabulary and SRS =====
create table vocab_items (
  id uuid primary key default gen_random_uuid(),
  lemma text not null,
  pos text,
  gloss_nl text,
  example_nl text,
  register text not null default 'standard',
  item_type text not null default 'word' check (item_type in ('word','collocation','idiom','expression')),
  family text,
  level_code text references levels(code),
  frequency_rank int,
  unique (lemma, item_type)
);

create table user_vocab (
  user_id uuid not null references profiles(id) on delete cascade,
  vocab_id uuid not null references vocab_items(id) on delete cascade,
  stage text not null default 'encountered' check (stage in ('encountered','recognized','understood','active','forgotten','retained')),
  ease real not null default 2.5,
  interval_days int not null default 0,
  repetitions int not null default 0,
  lapses int not null default 0,
  due_at timestamptz not null default now(),
  last_reviewed_at timestamptz,
  primary key (user_id, vocab_id)
);
create index on user_vocab (user_id, due_at);

-- ===== Progress =====
create table lesson_progress (
  user_id uuid not null references profiles(id) on delete cascade,
  lesson_id uuid not null references lessons(id) on delete cascade,
  status text not null default 'started' check (status in ('started','completed')),
  score real,
  completed_at timestamptz,
  primary key (user_id, lesson_id)
);

create table exercise_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  exercise_id uuid not null references exercises(id) on delete cascade,
  correct boolean not null,
  response jsonb,
  created_at timestamptz not null default now()
);

create table study_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  skill text not null check (skill in ('input','listening','vocabulary','grammar','speaking','reading','writing','revision')),
  seconds int not null,
  studied_on date not null default current_date
);
create index on study_log (user_id, studied_on);

-- ===== Tutor memory and error tracking =====
create table error_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  source text not null check (source in ('speaking','writing','exercise','tutor')),
  category text not null,
  grammar_tag text,
  learner_text text not null,
  correction text not null,
  explanation text,
  created_at timestamptz not null default now()
);
create index on error_log (user_id, category);

create table tutor_memory (
  user_id uuid primary key references profiles(id) on delete cascade,
  summary text not null default '',
  weaknesses jsonb not null default '[]',
  strengths jsonb not null default '[]',
  updated_at timestamptz not null default now()
);

create table tutor_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  session_id uuid not null,
  role text not null check (role in ('user','assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

-- ===== Speaking and writing =====
create table speaking_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  mode text not null,
  transcript text not null,
  feedback jsonb not null,
  scores jsonb not null,
  created_at timestamptz not null default now()
);

create table writing_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  task_type text not null,
  original text not null,
  feedback jsonb not null,
  scores jsonb not null,
  created_at timestamptz not null default now()
);

-- ===== Assessments =====
create table assessments (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('placement','weekly','monthly','milestone')),
  level_code text references levels(code),
  items jsonb not null
);

create table assessment_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  assessment_id uuid not null references assessments(id),
  skill_scores jsonb not null,
  estimated_level text,
  created_at timestamptz not null default now()
);

-- ===== Row level security =====
do $$
declare t text;
begin
  foreach t in array array['user_vocab','lesson_progress','exercise_attempts','study_log','error_log','tutor_memory','tutor_messages','speaking_sessions','writing_submissions','assessment_results']
  loop
    execute format('alter table %I enable row level security', t);
    execute format('create policy "%s_own" on %I for all using (user_id = auth.uid()) with check (user_id = auth.uid())', t, t);
  end loop;
end $$;

alter table profiles enable row level security;
create policy profiles_own on profiles for all using (id = auth.uid()) with check (id = auth.uid());

do $$
declare t text;
begin
  foreach t in array array['levels','modules','units','lessons','exercises','texts','audio_assets','vocab_items','assessments']
  loop
    execute format('alter table %I enable row level security', t);
    execute format('create policy "%s_read" on %I for select to authenticated using (true)', t, t);
  end loop;
end $$;

-- Create a profile row on signup
create or replace function handle_new_user() returns trigger as $$
begin
  insert into profiles (id) values (new.id);
  insert into tutor_memory (user_id) values (new.id);
  return new;
end $$ language plpgsql security definer;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function handle_new_user();
