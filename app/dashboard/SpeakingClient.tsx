/* eslint-disable */
'use client'

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTheme } from '@/lib/contexts/ThemeContext'
import { localeDirection, localeText } from '@/lib/locale'
import styles from './speaking.module.css'

type Role='student'|'teacher'|'admin'
type AnyItem=Record<string, any>
type Load='loading'|'ready'|'empty'|'error'|'database'

const translations: Record<string, string> = {
  Dashboard: 'لوحة التحكم', 'Speaking rooms': 'غرف المحادثة', Classes: 'الحصص',
  'Speaking moderation': 'إشراف المحادثات', Students: 'الطلاب', 'WhatsApp desk': 'مكتب واتساب', People: 'الأشخاص',
  student: 'طالب', teacher: 'معلم', admin: 'مدير', 'Database unavailable': 'قاعدة البيانات غير متاحة',
  'Nothing was changed or persisted. Try again when the service is available.': 'لم يتم إجراء أي تغيير أو حفظه. حاول مجدداً عند توفر الخدمة.',
  Retry: 'إعادة المحاولة', 'Request could not be completed.': 'تعذّر إكمال الطلب.',
  'Practice in spaces matched to your official level.': 'تدرّب في مساحات تناسب مستواك المعتمد.',
  'No eligible rooms are open right now.': 'لا توجد غرف مناسبة مفتوحة الآن.',
  'Check back when a teacher opens the next practice space.': 'تحقق لاحقاً عندما يفتح المعلم مساحة التدريب التالية.',
  'A focused space for safe English practice.': 'مساحة مخصصة للتدرب على الإنجليزية بأمان.',
  'Your level': 'مستواك', members: 'أعضاء', 'Open room': 'افتح الغرفة', 'Speaking room': 'غرفة المحادثة',
  'A moderated practice room.': 'غرفة تدريب بإشراف.', 'All rooms': 'كل الغرف', Dismiss: 'إغلاق',
  'Practice together': 'تدرّبوا معاً', 'Leave room': 'غادر الغرفة', 'Join room': 'انضم إلى الغرفة',
  'Voice practice unavailable': 'التدرب الصوتي غير متاح',
  'Text practice is available. Voice messages are not enabled while storage is unavailable.': 'التدرب النصي متاح. الرسائل الصوتية غير مفعّلة ما دام التخزين غير متاح.',
  'Room conversation': 'محادثة الغرفة', 'Join this room to view and send messages.': 'انضم إلى هذه الغرفة لعرض الرسائل وإرسالها.',
  Member: 'عضو', Report: 'إبلاغ', 'No messages yet. Start with a thoughtful prompt.': 'لا توجد رسائل بعد. ابدأ بموضوع مدروس.',
  'Write a text message': 'اكتب رسالة نصية', Send: 'إرسال', 'I need help reviewing this message.': 'أحتاج إلى المساعدة في مراجعة هذه الرسالة.',
  'Report sent to staff.': 'تم إرسال البلاغ إلى فريق العمل.', 'Moderation action saved.': 'تم حفظ إجراء الإشراف.',
  'Use the teacher-authorized moderation surface for a permitted room.': 'استخدم واجهة الإشراف المصرح بها للمعلم في غرفة مسموح بها.',
  'Room access is controlled by your staff permissions.': 'يخضع الوصول إلى الغرفة لصلاحيات فريق العمل الممنوحة لك.',
  'Enter a room and target ID from your permitted moderation workflow. No admin data is loaded here.': 'أدخل معرّف الغرفة والهدف من سير العمل المصرح لك به. لا يتم تحميل بيانات الإدارة هنا.',
  'Moderate a room': 'أشرف على غرفة', 'Room ID': 'معرّف الغرفة', 'Member user ID (for member actions)': 'معرّف العضو (لإجراءات الأعضاء)',
  'Message ID (for delete message)': 'معرّف الرسالة (لحذفها)', 'Report ID (for report actions)': 'معرّف البلاغ (لإجراءات البلاغ)',
  MUTE: 'كتم', UNMUTE: 'إلغاء الكتم', REMOVE: 'إزالة', BLOCK: 'حظر', UNBLOCK: 'إلغاء الحظر',
  DELETE_MESSAGE: 'حذف الرسالة', RESOLVE_REPORT: 'معالجة البلاغ', DISMISS_REPORT: 'رفض البلاغ',
  'Speaking management': 'إدارة المحادثات', 'Rooms, practice content, and safe moderation controls.': 'الغرف ومحتوى التدريب وأدوات الإشراف الآمن.',
  'Room created.': 'تم إنشاء الغرفة.', 'Content saved.': 'تم حفظ المحتوى.', 'Create a room': 'إنشاء غرفة',
  name: 'الاسم', description: 'الوصف', topic: 'الموضوع', prompt: 'المحفّز', maxMembers: 'الحد الأقصى للأعضاء',
  'Create room': 'إنشاء الغرفة', Rooms: 'الغرف', 'All levels': 'كل المستويات', 'Content library': 'مكتبة المحتوى',
  'Active prompts are available to eligible rooms.': 'تتوفر المحفّزات النشطة للغرف المناسبة.', 'Add content': 'إضافة محتوى',
  'New practice prompt': 'موضوع تدريب جديد',
  'Provider health, account lifecycle, and staff communication queue.': 'حالة الموفر ودورة حياة الحسابات وقائمة اتصالات فريق العمل.',
  'Provider status': 'حالة الموفر', 'Checking provider…': 'جارٍ التحقق من الموفر…',
  'Provider status unavailable.': 'حالة الموفر غير متاحة.',
  'Provider health never includes QR codes, auth tokens, or credentials.': 'لا تتضمن حالة الموفر رموز QR أو رموز المصادقة أو بيانات الاعتماد.',
  'Account created as disconnected.': 'تم إنشاء الحساب دون اتصال.', 'requested. Provider state was not assumed.': 'مطلوب. لم يتم افتراض حالة الموفر.',
  'Log out requested; provider state was not assumed.': 'تم طلب تسجيل الخروج؛ لم يتم افتراض حالة الموفر.',
  'Connect requested; provider state was not assumed.': 'تم طلب الاتصال؛ لم يتم افتراض حالة الموفر.',
  Accounts: 'الحسابات', 'Phone number': 'رقم الهاتف', 'Add account': 'إضافة حساب', 'Database unavailable. Account controls are disabled.': 'قاعدة البيانات غير متاحة. عناصر التحكم بالحساب معطلة.',
  'Log out': 'تسجيل الخروج', Connect: 'اتصال', Contacts: 'جهات الاتصال', Open: 'فتح',
  'No contacts available.': 'لا توجد جهات اتصال متاحة.', Conversations: 'المحادثات', unread: 'غير مقروءة',
  'No messages': 'لا توجد رسائل', 'No messages in this conversation.': 'لا توجد رسائل في هذه المحادثة.',
  'Queue a reply': 'أضف رداً إلى القائمة', 'Queue message': 'إضافة الرسالة إلى القائمة', Queue: 'قائمة الانتظار',
  'Checking queue…': 'جارٍ التحقق من قائمة الانتظار…', Pending: 'قيد الانتظار', Failed: 'فشل', Sent: 'تم الإرسال',
  'Queue status unavailable.': 'حالة قائمة الانتظار غير متاحة.', Pacing: 'الفاصل', 'max attempts': 'الحد الأقصى للمحاولات',
}
function t(language: 'ar' | 'en', english: string) { return localeText(language, translations[english] || english, english) }
function errorText(language: 'ar' | 'en', error: any) {
  const message = typeof error?.message === 'string' ? error.message : ''
  return message === 'Request could not be completed.' || !message ? t(language, 'Request could not be completed.') : message
}
function statusLabel(language: 'ar' | 'en', value: string) {
  const known: Record<string, string> = { OPEN: 'مفتوح', CLOSED: 'مغلق', ACTIVE: 'نشط', CONNECTED: 'متصل', DISCONNECTED: 'غير متصل', PENDING: 'قيد الانتظار', FAILED: 'فشل', SENT: 'تم الإرسال', DELIVERED: 'تم التسليم', READ: 'مقروء', QUEUED: 'في قائمة الانتظار', OUTBOUND: 'صادرة', INBOUND: 'واردة', RECONNECTING: 'جارٍ إعادة الاتصال', ERROR: 'خطأ', LOGGED_OUT: 'تم تسجيل الخروج', AVAILABLE: 'متاح', UNAVAILABLE: 'غير متاح', MANUAL: 'يدوي' }
  return localeText(language, known[value] || value, value.replaceAll('_', ' '))
}
function localizedField(item: AnyItem, key: string, language: 'ar' | 'en') {
  return item[`${key}${language === 'ar' ? 'Ar' : 'En'}`] || item[key]
}
async function request(path:string, options?:RequestInit){const r=await fetch(path,{...options,cache:'no-store',headers:{'Content-Type':'application/json',...(options?.headers||{})}});const body=await r.json().catch(()=>({}));if(!r.ok){const e=body?.error||body;throw Object.assign(new Error(e?.message||'Request could not be completed.'),{code:e?.code,status:r.status})}return body}
function useResource(path:string|null){const {language}=useTheme();const [state,setState]=useState<Load>('loading');const [items,setItems]=useState<AnyItem[]>([]);const [body,setBody]=useState<AnyItem>({});const [message,setMessage]=useState('');const load=useCallback(async()=>{if(!path)return;setState('loading');setMessage('');try{const data=await request(path);setBody(data);const next=Array.isArray(data)?data:(data.items||[]);setItems(next);setState(next.length?'ready':'empty')}catch(e:any){setMessage(errorText(language,e));setState(e.code==='DATABASE_UNAVAILABLE'||e.status===503?'database':'error')}},[path,language]);useEffect(()=>{void load()},[load]);return {state,items,body,message,reload:load}}
function Nav({role}:{role:Role}){const {language}=useTheme();const links=role==='student'?[['/dashboard/student','Dashboard'],['/dashboard/student/speaking','Speaking rooms'],['/dashboard/student/classes','Classes']]:role==='teacher'?[['/dashboard/teacher','Dashboard'],['/dashboard/teacher/speaking','Speaking moderation'],['/dashboard/teacher/students','Students']]:[['/dashboard/admin','Dashboard'],['/dashboard/admin/speaking','Speaking rooms'],['/dashboard/admin/whatsapp','WhatsApp desk'],['/dashboard/admin/people','People']];return <nav className={styles.nav}>{links.map(([href,label])=><Link href={href} key={href}>{t(language,label)}</Link>)}</nav>}
function Header({role,title,sub}:{role:Role,title:string,sub:string}){const {language}=useTheme();return <header className={styles.top}><div><div className={styles.eyebrow}>B Fluent EDU · {t(language,role)}</div><h1 className={styles.title}>{t(language,title)}</h1><p className={styles.muted}>{t(language,sub)}</p></div><Nav role={role}/></header>}
function State({state,message,retry}:{state:Load,message:string,retry:()=>void}){const {language}=useTheme();if(state==='loading')return <div className={styles.grid}>{[1,2,3].map(n=><div className={styles.skeleton} key={n}/>)}</div>;if(state==='database')return <div className={`${styles.notice} ${styles.warn}`}><strong>{t(language,'Database unavailable')}</strong><p>{t(language,'Nothing was changed or persisted. Try again when the service is available.')}</p><button className={styles.button} onClick={retry}>{t(language,'Retry')}</button></div>;if(state==='error')return <div className={styles.error} role="alert">{message}<button className={styles.button} onClick={retry}>{t(language,'Retry')}</button></div>;return null}
function date(v:any,language:'ar'|'en'){return v?new Intl.DateTimeFormat(language==='ar'?'ar':'en',{dateStyle:'medium',timeStyle:'short'}).format(new Date(v)):'—'}

export function StudentSpeaking(){
  const {language}=useTheme()
  const r=useResource('/api/student/speaking/rooms')
  return <main className={styles.shell} dir={localeDirection(language)}><div className={styles.wrap}><Header role="student" title="Speaking rooms" sub="Practice in spaces matched to your official level."/><State state={r.state} message={r.message} retry={r.reload}/>{r.state==='empty'&&<div className={styles.empty}>{t(language,'No eligible rooms are open right now.')}<br/><span className={styles.small}>{t(language,'Check back when a teacher opens the next practice space.')}</span></div>}<div className={styles.grid}>{r.state==='ready'&&r.items.map(x=><article className={styles.card} key={x.id}><span className={styles.badge}>{statusLabel(language,x.status)}</span><h2>{localizedField(x,'name',language)}</h2><p className={styles.muted}>{localizedField(x,'description',language)||t(language,'A focused space for safe English practice.')}</p><p className={styles.meta}>{x.level?.name||t(language,'Your level')} · {x._count?.members??0}/{x.maxMembers??'—'} {t(language,'members')}</p><Link className={`${styles.button} ${styles.primary}`} href={`/dashboard/student/speaking/${x.id}`}>{t(language,'Open room')}</Link></article>)}</div></div></main>
}
export function StudentRoom({id}:{id:string}){
  const {language}=useTheme()
  const room=useResource(`/api/student/speaking/rooms/${id}`)
  const [joined,setJoined]=useState(false);const [text,setText]=useState('');const [messages,setMessages]=useState<AnyItem[]>([]);const [note,setNote]=useState('');const [busy,setBusy]=useState(false)
  const loadMessages=useCallback(async()=>{try{const d=await request(`/api/student/speaking/rooms/${id}/messages`);setMessages(d.items||[])}catch(e:any){setNote(errorText(language,e))}},[id,language])
  useEffect(()=>{if(room.body.member?.status==='ACTIVE'){setJoined(true);void loadMessages()}},[room.body.member,loadMessages])
  async function action(method:string){setBusy(true);try{await request(`/api/student/speaking/rooms/${id}`,{method});setJoined(method==='POST');await room.reload();if(method==='POST')void loadMessages()}catch(e:any){setNote(errorText(language,e))}finally{setBusy(false)}}
  async function send(){if(!text.trim())return;try{await request(`/api/student/speaking/rooms/${id}/messages`,{method:'POST',body:JSON.stringify({messageType:'TEXT',text:text.trim()})});setText('');void loadMessages()}catch(e:any){setNote(errorText(language,e))}}
  async function report(messageId:string){try{await request(`/api/student/speaking/rooms/${id}/reports`,{method:'POST',body:JSON.stringify({messageId,reason:'I need help reviewing this message.'})});setNote(t(language,'Report sent to staff.'))}catch(e:any){setNote(errorText(language,e))}}
  const roomTitle=localizedField(room.body,'name',language)||t(language,'Speaking room')
  const roomTopic=localizedField(room.body,'topic',language)||t(language,'A moderated practice room.')
  return <main className={styles.shell} dir={localeDirection(language)}><div className={styles.wrap}><Header role="student" title={roomTitle} sub={roomTopic}/><Link className={styles.link} href="/dashboard/student/speaking">← {t(language,'All rooms')}</Link><State state={room.state} message={room.message} retry={room.reload}/>{note&&<div className={styles.error}>{note}<button className={styles.button} onClick={()=>setNote('')}>{t(language,'Dismiss')}</button></div>}{room.state==='ready'&&<div className={styles.grid}><section className={styles.card}><span className={styles.badge}>{statusLabel(language,room.body.status)}</span><h2>{localizedField(room.body,'prompt',language)||t(language,'Practice together')}</h2><p>{localizedField(room.body,'description',language)}</p><div className={styles.actions}>{joined?<button className={`${styles.button} ${styles.danger}`} disabled={busy} onClick={()=>void action('DELETE')}>{t(language,'Leave room')}</button>:<button className={`${styles.button} ${styles.primary}`} disabled={busy} onClick={()=>void action('POST')}>{t(language,'Join room')}</button>}</div><div className={`${styles.notice} ${styles.warn}`}><strong>{t(language,'Voice practice unavailable')}</strong><p>{t(language,'Text practice is available. Voice messages are not enabled while storage is unavailable.')}</p></div></section><section className={`${styles.card} ${styles.wide}`}><h2>{t(language,'Room conversation')}</h2>{!joined?<div className={styles.empty}>{t(language,'Join this room to view and send messages.')}</div>:<><div className={styles.messages}>{messages.length?messages.map(m=><div className={`${styles.bubble} ${m.senderId===room.body.member?.userId?styles.mine:''}`} key={m.id}><div>{m.text}</div><span className={styles.meta}>{m.sender?.name||t(language,'Member')} · {date(m.createdAt,language)}</span>{m.senderId!==room.body.member?.userId&&<button className={styles.link} onClick={()=>void report(m.id)}>{t(language,'Report')}</button>}</div>):<div className={styles.empty}>{t(language,'No messages yet. Start with a thoughtful prompt.')}</div>}</div><div className={styles.actions}><input className={styles.input} value={text} onChange={e=>setText(e.target.value)} placeholder={t(language,'Write a text message')} onKeyDown={e=>{if(e.key==='Enter')void send()}}/><button className={`${styles.button} ${styles.primary}`} onClick={()=>void send()}>{t(language,'Send')}</button></div></>}</section></div>}</div></main>
}

export function TeacherSpeaking(){
  const {language}=useTheme()
  const [roomId,setRoomId]=useState('');const [memberUserId,setMemberUserId]=useState('');const [messageId,setMessageId]=useState('');const [reportId,setReportId]=useState('');const [note,setNote]=useState('');const [busy,setBusy]=useState(false)
  async function moderate(action:string){if(!roomId)return;setBusy(true);try{await request(`/api/teacher/speaking/rooms/${roomId}/moderation`,{method:'POST',body:JSON.stringify({action,memberUserId:memberUserId||null,messageId:messageId||null,reportId:reportId||null})});setNote(t(language,'Moderation action saved.'))}catch(e:any){setNote(errorText(language,e))}finally{setBusy(false)}}
  return <main className={styles.shell} dir={localeDirection(language)}><div className={styles.wrap}><Header role="teacher" title="Speaking moderation" sub="Use the teacher-authorized moderation surface for a permitted room."/><div className={styles.notice}><strong>{t(language,'Room access is controlled by your staff permissions.')}</strong><p>{t(language,'Enter a room and target ID from your permitted moderation workflow. No admin data is loaded here.')}</p></div>{note&&<div className={styles.notice}>{note}</div>}<section className={styles.card}><h2>{t(language,'Moderate a room')}</h2><div className={styles.form}><input className={styles.input} value={roomId} onChange={e=>setRoomId(e.target.value)} placeholder={t(language,'Room ID')}/><input className={styles.input} value={memberUserId} onChange={e=>setMemberUserId(e.target.value)} placeholder={t(language,'Member user ID (for member actions)')}/><input className={styles.input} value={messageId} onChange={e=>setMessageId(e.target.value)} placeholder={t(language,'Message ID (for delete message)')}/><input className={styles.input} value={reportId} onChange={e=>setReportId(e.target.value)} placeholder={t(language,'Report ID (for report actions)')}/><div className={styles.actions}>{['MUTE','UNMUTE','REMOVE','BLOCK','UNBLOCK','DELETE_MESSAGE','RESOLVE_REPORT','DISMISS_REPORT'].map(action=><button className={styles.button} disabled={busy||!roomId||(action==='DELETE_MESSAGE'&&!messageId)||(['MUTE','UNMUTE','REMOVE','BLOCK','UNBLOCK'].includes(action)&&!memberUserId)||(['RESOLVE_REPORT','DISMISS_REPORT'].includes(action)&&!reportId)} key={action} onClick={()=>void moderate(action)}>{t(language,action)}</button>)}</div></div></section></div></main>
}

export function AdminSpeaking(){
  const {language}=useTheme()
  const rooms=useResource('/api/admin/speaking/rooms');const content=useResource('/api/admin/speaking/topics')
  const [form,setForm]=useState({name:'',description:'',topic:'',prompt:'',maxMembers:'12',status:'OPEN'});const [notice,setNotice]=useState('')
  async function create(){try{await request('/api/admin/speaking/rooms',{method:'POST',body:JSON.stringify({...form,maxMembers:Number(form.maxMembers),vocabulary:[]})});setNotice(t(language,'Room created.'));void rooms.reload()}catch(e:any){setNotice(errorText(language,e))}}
  async function addContent(){try{await request('/api/admin/speaking/topics',{method:'POST',body:JSON.stringify({roomId:null,contentType:'PROMPT',text:'New practice prompt',status:'ACTIVE'})});setNotice(t(language,'Content saved.'));void content.reload()}catch(e:any){setNotice(errorText(language,e))}}
  return <main className={styles.shell} dir={localeDirection(language)}><div className={styles.wrap}><Header role="admin" title="Speaking management" sub="Rooms, practice content, and safe moderation controls."/><State state={rooms.state} message={rooms.message} retry={rooms.reload}/>{notice&&<div className={styles.notice}>{notice}</div>}<div className={styles.grid}><section className={styles.card}><h2>{t(language,'Create a room')}</h2><div className={styles.form}>{(['name','description','topic','prompt','maxMembers'] as const).map(k=><input className={styles.input} key={k} placeholder={t(language,k)} value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})}/>)}<button className={`${styles.button} ${styles.primary}`} onClick={()=>void create()}>{t(language,'Create room')}</button></div></section><section className={styles.card}><h2>{t(language,'Rooms')}</h2>{rooms.items.map(x=><div className={styles.row} key={x.id}><span><strong>{localizedField(x,'name',language)}</strong><br/><span className={styles.meta}>{statusLabel(language,x.status)} · {x._count?.members??0} {t(language,'members')}</span></span><span className={styles.badge}>{x.level?.name||t(language,'All levels')}</span></div>)}</section><section className={styles.card}><h2>{t(language,'Content library')}</h2><p className={styles.muted}>{t(language,'Active prompts are available to eligible rooms.')}</p><button className={styles.button} onClick={()=>void addContent()}>{t(language,'Add content')}</button>{content.items.map(x=><div className={styles.row} key={x.id}>{localizedField(x,'text',language)||x.contentType}<span className={styles.meta}>{statusLabel(language,x.status)}</span></div>)}</section></div></div></main>
}

export function AdminWhatsApp(){
  const {language}=useTheme()
  const accounts=useResource('/api/admin/whatsapp/accounts');const contacts=useResource('/api/admin/whatsapp/contacts');const conversations=useResource('/api/admin/whatsapp/conversations');const queue=useResource('/api/admin/whatsapp/queue');const provider=useResource('/api/whatsapp/provider-status')
  const [phone,setPhone]=useState('');const [selected,setSelected]=useState('');const [messages,setMessages]=useState<AnyItem[]>([]);const [text,setText]=useState('');const [notice,setNotice]=useState('')
  async function create(){try{await request('/api/admin/whatsapp/accounts',{method:'POST',body:JSON.stringify({provider:'BAILEYS',phoneNumber:phone})});setPhone('');setNotice(t(language,'Account created as disconnected.'));void accounts.reload()}catch(e:any){setNotice(errorText(language,e))}}
  async function lifecycle(id:string,action:string){try{await request(`/api/admin/whatsapp/accounts/${id}`,{method:'POST',body:JSON.stringify({action})});setNotice(t(language,action==='LOGOUT'?'Log out requested; provider state was not assumed.':'Connect requested; provider state was not assumed.'));void accounts.reload()}catch(e:any){setNotice(errorText(language,e))}}
  async function open(id:string){setSelected(id);try{const d=await request(`/api/admin/whatsapp/conversations/${id}/messages`);setMessages(d.items||[])}catch(e:any){setNotice(errorText(language,e))}}
  async function send(){if(!text.trim()||!selected)return;try{await request(`/api/admin/whatsapp/conversations/${selected}/messages`,{method:'POST',body:JSON.stringify({body:text.trim()})});setText('');void open(selected);void queue.reload()}catch(e:any){setNotice(errorText(language,e))}}
  return <main className={styles.shell} dir={localeDirection(language)}><div className={styles.wrap}>
    <Header role="admin" title="WhatsApp desk" sub="Provider health, account lifecycle, and staff communication queue."/>
    <div className={styles.notice}><strong>{t(language,'Provider status')}</strong><p>{provider.state==='loading'?t(language,'Checking provider…'):provider.body.status?`${statusLabel(language,provider.body.status)}${provider.body.reason?` · ${provider.body.reason}`:''}`:t(language,'Provider status unavailable.')}</p><p className={styles.small}>{t(language,'Provider health never includes QR codes, auth tokens, or credentials.')}</p></div>
    {notice&&<div className={styles.notice}>{notice}</div>}
    <div className={styles.grid}>
      <section className={styles.card}><h2>{t(language,'Accounts')}</h2><div className={styles.form}><input className={styles.input} value={phone} onChange={e=>setPhone(e.target.value)} placeholder={t(language,'Phone number')}/><button className={`${styles.button} ${styles.primary}`} onClick={()=>void create()} disabled={!phone}>{t(language,'Add account')}</button></div>{accounts.state==='database'&&<p className={styles.muted}>{t(language,'Database unavailable. Account controls are disabled.')}</p>}{accounts.items.map(x=><div className={styles.row} key={x.id}><span><strong>{x.phoneNumber}</strong><br/><span className={styles.meta}>{x.provider} · {statusLabel(language,x.authPersistenceStatus)}</span></span><span><span className={styles.badge}>{statusLabel(language,x.status)}</span><br/><button className={styles.button} onClick={()=>void lifecycle(x.id,x.status==='CONNECTED'?'LOGOUT':'CONNECT')}>{x.status==='CONNECTED'?t(language,'Log out'):t(language,'Connect')}</button></span></div>)}</section>
      <section className={styles.card}><h2>{t(language,'Contacts')}</h2>{contacts.items.length?contacts.items.slice(0,8).map(x=><div className={styles.row} key={x.id}><span>{x.displayName||x.phoneNumber}<br/><span className={styles.meta}>{statusLabel(language,x.status)}</span></span><button className={styles.button} onClick={async()=>{try{const d=await request('/api/admin/whatsapp/conversations',{method:'POST',body:JSON.stringify({accountId:x.accountId,contactId:x.id})});void conversations.reload();void open(d.id)}catch(e:any){setNotice(e.message)}}}>{t(language,'Open')}</button></div>):<div className={styles.empty}>{t(language,'No contacts available.')}</div>}</section>
      <section className={`${styles.card} ${styles.wide}`}><h2>{t(language,'Conversations')}</h2><div className={styles.grid}>{conversations.items.map(x=><button className={styles.card} key={x.id} onClick={()=>void open(x.id)}><strong>{x.contact?.displayName||x.contact?.normalizedPhone}</strong><p className={styles.meta}>{statusLabel(language,x.status)} · {x.unreadCount} {t(language,'unread')}</p><p>{x.messages?.[0]?.body||t(language,'No messages')}</p></button>)}</div>{selected&&<><div className={styles.messages}>{messages.length?messages.map(x=><div className={styles.bubble} key={x.id}>{x.body}<div className={styles.meta}>{statusLabel(language,x.direction)} · {statusLabel(language,x.deliveryStatus)}</div></div>):<div className={styles.empty}>{t(language,'No messages in this conversation.')}</div>}</div><div className={styles.actions}><input className={styles.input} value={text} onChange={e=>setText(e.target.value)} placeholder={t(language,'Queue a reply')}/><button className={`${styles.button} ${styles.primary}`} onClick={()=>void send()}>{t(language,'Queue message')}</button></div></>}</section>
      <section className={styles.card}><h2>{t(language,'Queue')}</h2>{queue.state==='loading'?<div className={styles.muted}>{t(language,'Checking queue…')}</div>:queue.body.counts?<><div className={styles.row}><span>{t(language,'Pending')}</span><strong>{queue.body.counts.pending}</strong></div><div className={styles.row}><span>{t(language,'Failed')}</span><strong>{queue.body.counts.failed}</strong></div><div className={styles.row}><span>{t(language,'Sent')}</span><strong>{queue.body.counts.sent}</strong></div><p className={styles.meta}>{t(language,'Pacing')} {queue.body.pacingMs}ms · {t(language,'max attempts')} {queue.body.maxAttempts}</p></>:<div className={styles.empty}>{t(language,'Queue status unavailable.')}</div>}</section>
    </div>
  </div></main>
}