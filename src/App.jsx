import { useState, useEffect, useRef } from 'react'

// ==================== STORAGE HELPERS ====================
const STORAGE_KEY = 'bm_data'
function loadData() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {} } catch { return {} }
}
function saveData(d) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(d))
}

// ==================== INITIAL DATA ====================
const DEFAULT_OWNER = { id: 1, name: 'Owner', username: 'owner', password: 'owner1234', role: 'owner' }

function initData(raw) {
  return {
    employees: raw.employees || [],
    attendance: raw.attendance || [],
    leaves: raw.leaves || [],
    tasks: raw.tasks || [],
    schedules: raw.schedules || [],
    nextEmpId: raw.nextEmpId || 2,
    nextTaskId: raw.nextTaskId || 1,
    nextLeaveId: raw.nextLeaveId || 1,
  }
}

// ==================== UTILS ====================
function fmt(n) { return Number(n || 0).toLocaleString() }
function today() { return new Date().toISOString().slice(0, 10) }
function thaiDate(d) {
  if (!d) return ''
  const dt = new Date(d)
  return dt.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })
}
function monthOf(d) { return d ? d.slice(0, 7) : '' }

const ROLES = ['พนักงานทั่วไป', 'แม่บ้าน', 'รปภ.', 'ช่างซ่อม', 'พนักงานสระน้ำ', 'หัวหน้า']
const LEAVE_TYPES = ['ลาป่วย', 'ลาพักร้อน', 'ลากิจ', 'ลาอื่นๆ']
const TASK_STATUS = ['รอดำเนินการ', 'กำลังทำ', 'เสร็จแล้ว']
const DAYS_TH = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส']

// ==================== COMPONENTS ====================

function Modal({ title, onClose, children }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: '#fff', borderRadius: 12, width: '100%', maxWidth: 480, maxHeight: '90vh', overflow: 'auto', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #eee' }}>
          <h3 style={{ margin: 0, fontSize: 16 }}>{title}</h3>
          <button onClick={onClose} style={{ border: 'none', background: 'none', fontSize: 20, cursor: 'pointer', color: '#888' }}>✕</button>
        </div>
        <div style={{ padding: 20 }}>{children}</div>
      </div>
    </div>
  )
}

function Input({ label, ...props }) {
  return (
    <div style={{ marginBottom: 12 }}>
      {label && <label style={{ display: 'block', fontSize: 13, color: '#555', marginBottom: 4 }}>{label}</label>}
      <input style={{ width: '100%', padding: '8px 10px', border: '1px solid #ddd', borderRadius: 7, fontSize: 14, boxSizing: 'border-box' }} {...props} />
    </div>
  )
}

function Select({ label, options, ...props }) {
  return (
    <div style={{ marginBottom: 12 }}>
      {label && <label style={{ display: 'block', fontSize: 13, color: '#555', marginBottom: 4 }}>{label}</label>}
      <select style={{ width: '100%', padding: '8px 10px', border: '1px solid #ddd', borderRadius: 7, fontSize: 14, boxSizing: 'border-box' }} {...props}>
        {options.map(o => typeof o === 'string'
          ? <option key={o} value={o}>{o}</option>
          : <option key={o.value} value={o.value}>{o.label}</option>
        )}
      </select>
    </div>
  )
}

function Btn({ children, color = '#1a7be6', outline, small, ...props }) {
  return (
    <button style={{
      background: outline ? 'transparent' : color,
      color: outline ? color : '#fff',
      border: `1.5px solid ${color}`,
      borderRadius: 7,
      padding: small ? '4px 12px' : '8px 18px',
      fontSize: small ? 12 : 14,
      cursor: 'pointer',
      fontWeight: 500,
    }} {...props}>{children}</button>
  )
}

// ==================== LOGIN PAGE ====================
function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')

  function handleLogin() {
    const raw = loadData()
    const data = initData(raw)
    const owner = DEFAULT_OWNER
    if (username === owner.username && password === owner.password) { onLogin(owner); return }
    const emp = data.employees.find(e => e.username === username && e.password === password && !e.deleted)
    if (emp) { onLogin({ ...emp, role: 'employee' }); return }
    setErr('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง')
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#0f2942 0%,#1a5276 60%,#2980b9 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: 36, width: '100%', maxWidth: 360, boxShadow: '0 12px 40px rgba(0,0,0,0.25)' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 40 }}>🏊</div>
          <h2 style={{ margin: '8px 0 4px', color: '#0f2942' }}>Blue Monte Pool Villa</h2>
          <p style={{ margin: 0, color: '#888', fontSize: 13 }}>ระบบจัดการพนักงาน</p>
        </div>
        <Input label="ชื่อผู้ใช้" value={username} onChange={e => setUsername(e.target.value)} placeholder="username" />
        <Input label="รหัสผ่าน" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="password"
          onKeyDown={e => e.key === 'Enter' && handleLogin()} />
        {err && <p style={{ color: '#e74c3c', fontSize: 13, margin: '4px 0 8px' }}>{err}</p>}
        <button onClick={handleLogin} style={{ width: '100%', background: '#1a5276', color: '#fff', border: 'none', borderRadius: 7, padding: '10px', fontSize: 15, cursor: 'pointer', fontWeight: 600 }}>เข้าสู่ระบบ</button>
        <p style={{ textAlign: 'center', fontSize: 12, color: '#aaa', marginTop: 16 }}>owner: owner / owner1234</p>
      </div>
    </div>
  )
}

// ==================== EMPLOYEES PAGE ====================
function EmployeesPage({ data, setData, currentUser }) {
  const isOwner = currentUser.role === 'owner'
  const [showAdd, setShowAdd] = useState(false)
  const [editEmp, setEditEmp] = useState(null)
  const [form, setForm] = useState({ name: '', username: '', password: '', role: ROLES[0], salary: '', phone: '', startDate: today() })

  function openAdd() { setForm({ name: '', username: '', password: '', role: ROLES[0], salary: '', phone: '', startDate: today() }); setEditEmp(null); setShowAdd(true) }
  function openEdit(emp) { setForm({ ...emp }); setEditEmp(emp); setShowAdd(true) }

  function save() {
    if (!form.name.trim() || !form.username.trim() || !form.password.trim()) return alert('กรุณากรอกข้อมูลให้ครบ')
    const newData = { ...data }
    if (editEmp) {
      newData.employees = data.employees.map(e => e.id === editEmp.id ? { ...e, ...form } : e)
    } else {
      newData.employees = [...data.employees, { ...form, id: data.nextEmpId, deleted: false }]
      newData.nextEmpId = data.nextEmpId + 1
    }
    setData(newData)
    setShowAdd(false)
  }

  function del(emp) {
    if (!confirm(`ลบพนักงาน "${emp.name}" ?`)) return
    setData({ ...data, employees: data.employees.map(e => e.id === emp.id ? { ...e, deleted: true } : e) })
  }

  const emps = data.employees.filter(e => !e.deleted)

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ margin: 0, fontSize: 18 }}>👥 พนักงาน ({emps.length} คน)</h2>
        {isOwner && <Btn onClick={openAdd} color="#27ae60">+ เพิ่มพนักงาน</Btn>}
      </div>
      {emps.length === 0 && <p style={{ color: '#aaa', textAlign: 'center', marginTop: 40 }}>ยังไม่มีพนักงาน</p>}
      <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))' }}>
        {emps.map(emp => (
          <div key={emp.id} style={{ background: '#fff', borderRadius: 10, padding: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.07)', border: '1px solid #eee' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{emp.name}</div>
                <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{emp.role}</div>
              </div>
              <span style={{ background: '#eaf4ff', color: '#1a7be6', borderRadius: 20, padding: '2px 10px', fontSize: 12 }}>{emp.username}</span>
            </div>
            <div style={{ marginTop: 10, fontSize: 13, color: '#555', display: 'flex', flexDirection: 'column', gap: 3 }}>
              <span>💰 เงินเดือน: <b>฿{fmt(emp.salary)}</b></span>
              {emp.phone && <span>📱 {emp.phone}</span>}
              <span>📅 เริ่มงาน: {thaiDate(emp.startDate)}</span>
            </div>
            {isOwner && (
              <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                <Btn small outline onClick={() => openEdit(emp)}>แก้ไข</Btn>
                <Btn small outline color="#e74c3c" onClick={() => del(emp)}>ลบ</Btn>
              </div>
            )}
          </div>
        ))}
      </div>
      {showAdd && (
        <Modal title={editEmp ? 'แก้ไขพนักงาน' : 'เพิ่มพนักงาน'} onClose={() => setShowAdd(false)}>
          <Input label="ชื่อ-นามสกุล *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <Input label="ชื่อผู้ใช้ (username) *" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} />
          <Input label="รหัสผ่าน *" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
          <Select label="ตำแหน่ง" options={ROLES} value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} />
          <Input label="เงินเดือน (บาท)" type="text" inputMode="decimal" value={form.salary} onChange={e => setForm({ ...form, salary: e.target.value })} />
          <Input label="เบอร์โทร" value={form.phone || ''} onChange={e => setForm({ ...form, phone: e.target.value })} />
          <Input label="วันที่เริ่มงาน" type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} />
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
            <Btn outline color="#888" onClick={() => setShowAdd(false)}>ยกเลิก</Btn>
            <Btn onClick={save} color="#27ae60">บันทึก</Btn>
          </div>
        </Modal>
      )}
    </div>
  )
}

// ==================== ATTENDANCE PAGE ====================
function AttendancePage({ data, setData, currentUser }) {
  const isOwner = currentUser.role === 'owner'
  const emps = data.employees.filter(e => !e.deleted)
  const [month, setMonth] = useState(today().slice(0, 7))

  function checkin(empId) {
    const already = data.attendance.find(a => a.empId === empId && a.date === today() && !a.out)
    if (already) return alert('เช็คอินแล้ววันนี้')
    setData({ ...data, attendance: [...data.attendance, { id: Date.now(), empId, date: today(), in: new Date().toTimeString().slice(0, 5), out: null }] })
  }

  function checkout(empId) {
    const rec = data.attendance.find(a => a.empId === empId && a.date === today() && !a.out)
    if (!rec) return alert('ยังไม่ได้เช็คอินวันนี้')
    setData({ ...data, attendance: data.attendance.map(a => a.id === rec.id ? { ...a, out: new Date().toTimeString().slice(0, 5) } : a) })
  }

  const viewEmps = isOwner ? emps : emps.filter(e => e.id === currentUser.id)
  const filtered = data.attendance.filter(a => monthOf(a.date) === month)

  return (
    <div>
      <h2 style={{ margin: '0 0 16px', fontSize: 18 }}>⏰ เช็คอิน / เช็คเอาท์</h2>
      <div style={{ background: '#fff', borderRadius: 10, padding: 16, marginBottom: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
        <div style={{ fontWeight: 600, marginBottom: 12 }}>📅 วันนี้ {thaiDate(today())}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {viewEmps.map(emp => {
            const rec = data.attendance.find(a => a.empId === emp.id && a.date === today())
            return (
              <div key={emp.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 14 }}><b>{emp.name}</b> <span style={{ color: '#888', fontSize: 12 }}>{emp.role}</span></span>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  {rec && <span style={{ fontSize: 12, color: '#27ae60' }}>เข้า {rec.in}{rec.out ? ` / ออก ${rec.out}` : ''}</span>}
                  {!rec && <Btn small color="#27ae60" onClick={() => checkin(emp.id)}>เช็คอิน</Btn>}
                  {rec && !rec.out && <Btn small color="#e67e22" onClick={() => checkout(emp.id)}>เช็คเอาท์</Btn>}
                  {rec && rec.out && <span style={{ fontSize: 12, color: '#aaa' }}>✓ เสร็จแล้ว</span>}
                </div>
              </div>
            )
          })}
        </div>
      </div>
      {isOwner && (
        <div style={{ background: '#fff', borderRadius: 10, padding: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontWeight: 600 }}>📋 ประวัติการเข้างาน</div>
            <input type="month" value={month} onChange={e => setMonth(e.target.value)} style={{ border: '1px solid #ddd', borderRadius: 7, padding: '4px 8px', fontSize: 13 }} />
          </div>
          {filtered.length === 0 && <p style={{ color: '#aaa', textAlign: 'center' }}>ไม่มีข้อมูล</p>}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead><tr style={{ background: '#f5f7fa' }}>
                {['วันที่', 'พนักงาน', 'เวลาเข้า', 'เวลาออก'].map(h => <th key={h} style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 600 }}>{h}</th>)}
              </tr></thead>
              <tbody>
                {[...filtered].sort((a, b) => b.date.localeCompare(a.date)).map(a => {
                  const emp = emps.find(e => e.id === a.empId)
                  return (
                    <tr key={a.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={{ padding: '7px 10px' }}>{thaiDate(a.date)}</td>
                      <td style={{ padding: '7px 10px' }}>{emp?.name || '-'}</td>
                      <td style={{ padding: '7px 10px', color: '#27ae60' }}>{a.in}</td>
                      <td style={{ padding: '7px 10px', color: a.out ? '#e67e22' : '#aaa' }}>{a.out || 'ยังไม่ออก'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

// ==================== LEAVE PAGE ====================
function LeavePage({ data, setData, currentUser }) {
  const isOwner = currentUser.role === 'owner'
  const emps = data.employees.filter(e => !e.deleted)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ empId: '', type: LEAVE_TYPES[0], startDate: today(), endDate: today(), reason: '' })

  function save() {
    if (!form.empId || !form.startDate || !form.endDate) return alert('กรุณากรอกข้อมูลให้ครบ')
    const newLeave = { ...form, id: data.nextLeaveId, empId: Number(form.empId), status: isOwner ? 'อนุมัติ' : 'รอการอนุมัติ', createdAt: today() }
    setData({ ...data, leaves: [...data.leaves, newLeave], nextLeaveId: data.nextLeaveId + 1 })
    setShowAdd(false)
  }

  function approve(id) { setData({ ...data, leaves: data.leaves.map(l => l.id === id ? { ...l, status: 'อนุมัติ' } : l) }) }
  function reject(id) { setData({ ...data, leaves: data.leaves.map(l => l.id === id ? { ...l, status: 'ไม่อนุมัติ' } : l) }) }

  const viewLeaves = isOwner ? data.leaves : data.leaves.filter(l => l.empId === currentUser.id)
  const statusColor = { 'อนุมัติ': '#27ae60', 'รอการอนุมัติ': '#e67e22', 'ไม่อนุมัติ': '#e74c3c' }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ margin: 0, fontSize: 18 }}>🏖️ การลา ({viewLeaves.length} รายการ)</h2>
        <Btn onClick={() => { setForm({ empId: isOwner ? '' : String(currentUser.id), type: LEAVE_TYPES[0], startDate: today(), endDate: today(), reason: '' }); setShowAdd(true) }} color="#8e44ad">+ ขอลา</Btn>
      </div>
      {viewLeaves.length === 0 && <p style={{ color: '#aaa', textAlign: 'center', marginTop: 40 }}>ไม่มีรายการลา</p>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {[...viewLeaves].sort((a, b) => b.id - a.id).map(l => {
          const emp = emps.find(e => e.id === l.empId)
          return (
            <div key={l.id} style={{ background: '#fff', borderRadius: 10, padding: 14, boxShadow: '0 2px 8px rgba(0,0,0,0.07)', border: '1px solid #eee' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                <div>
                  <b>{emp?.name || '-'}</b> <span style={{ color: '#888', fontSize: 12 }}>({l.type})</span>
                  <div style={{ fontSize: 13, color: '#555', marginTop: 4 }}>{thaiDate(l.startDate)} — {thaiDate(l.endDate)}</div>
                  {l.reason && <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>เหตุผล: {l.reason}</div>}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                  <span style={{ background: statusColor[l.status] + '22', color: statusColor[l.status], borderRadius: 20, padding: '2px 10px', fontSize: 12, fontWeight: 600 }}>{l.status}</span>
                  {isOwner && l.status === 'รอการอนุมัติ' && (
                    <div style={{ display: 'flex', gap: 6 }}>
                      <Btn small color="#27ae60" onClick={() => approve(l.id)}>อนุมัติ</Btn>
                      <Btn small color="#e74c3c" onClick={() => reject(l.id)}>ไม่อนุมัติ</Btn>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
      {showAdd && (
        <Modal title="ขอลา" onClose={() => setShowAdd(false)}>
          {isOwner && <Select label="พนักงาน" options={[{ value: '', label: '-- เลือกพนักงาน --' }, ...emps.map(e => ({ value: String(e.id), label: e.name }))]} value={form.empId} onChange={e => setForm({ ...form, empId: e.target.value })} />}
          <Select label="ประเภทการลา" options={LEAVE_TYPES} value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} />
          <Input label="วันที่เริ่มลา" type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} />
          <Input label="วันที่สิ้นสุด" type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} />
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 13, color: '#555', marginBottom: 4 }}>เหตุผล</label>
            <textarea value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} style={{ width: '100%', padding: '8px 10px', border: '1px solid #ddd', borderRadius: 7, fontSize: 14, boxSizing: 'border-box', minHeight: 80, resize: 'vertical' }} />
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Btn outline color="#888" onClick={() => setShowAdd(false)}>ยกเลิก</Btn>
            <Btn onClick={save} color="#8e44ad">ส่งคำขอ</Btn>
          </div>
        </Modal>
      )}
    </div>
  )
}

// ==================== TASKS PAGE ====================
function TasksPage({ data, setData, currentUser }) {
  const isOwner = currentUser.role === 'owner'
  const emps = data.employees.filter(e => !e.deleted)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ title: '', desc: '', assignTo: '', dueDate: '', status: TASK_STATUS[0] })

  function save() {
    if (!form.title.trim()) return alert('กรุณากรอกชื่องาน')
    const newTask = { ...form, id: data.nextTaskId, assignTo: form.assignTo ? Number(form.assignTo) : null, createdAt: today(), createdBy: currentUser.id }
    setData({ ...data, tasks: [...data.tasks, newTask], nextTaskId: data.nextTaskId + 1 })
    setShowAdd(false)
  }

  function updateStatus(id, status) { setData({ ...data, tasks: data.tasks.map(t => t.id === id ? { ...t, status } : t) }) }
  function del(id) { if (!confirm('ลบงานนี้?')) return; setData({ ...data, tasks: data.tasks.filter(t => t.id !== id) }) }

  const viewTasks = isOwner ? data.tasks : data.tasks.filter(t => t.assignTo === currentUser.id || t.createdBy === currentUser.id)
  const statusColor = { 'รอดำเนินการ': '#e67e22', 'กำลังทำ': '#1a7be6', 'เสร็จแล้ว': '#27ae60' }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ margin: 0, fontSize: 18 }}>📋 งาน ({viewTasks.length} รายการ)</h2>
        <Btn onClick={() => { setForm({ title: '', desc: '', assignTo: '', dueDate: '', status: TASK_STATUS[0] }); setShowAdd(true) }} color="#e67e22">+ มอบหมายงาน</Btn>
      </div>
      {viewTasks.length === 0 && <p style={{ color: '#aaa', textAlign: 'center', marginTop: 40 }}>ไม่มีงาน</p>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {[...viewTasks].sort((a, b) => b.id - a.id).map(t => {
          const assignEmp = emps.find(e => e.id === t.assignTo)
          const isOverdue = t.dueDate && t.dueDate < today() && t.status !== 'เสร็จแล้ว'
          return (
            <div key={t.id} style={{ background: '#fff', borderRadius: 10, padding: 14, boxShadow: '0 2px 8px rgba(0,0,0,0.07)', border: `1px solid ${isOverdue ? '#e74c3c44' : '#eee'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{t.title}</div>
                  {t.desc && <div style={{ fontSize: 13, color: '#666', marginTop: 3 }}>{t.desc}</div>}
                  <div style={{ fontSize: 12, color: '#888', marginTop: 6, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    {assignEmp && <span>👤 {assignEmp.name}</span>}
                    {t.dueDate && <span style={{ color: isOverdue ? '#e74c3c' : '#888' }}>📅 {thaiDate(t.dueDate)}{isOverdue ? ' ⚠️เกินกำหนด' : ''}</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                  <span style={{ background: statusColor[t.status] + '22', color: statusColor[t.status], borderRadius: 20, padding: '2px 10px', fontSize: 12, fontWeight: 600 }}>{t.status}</span>
                  <select value={t.status} onChange={e => updateStatus(t.id, e.target.value)} style={{ fontSize: 12, border: '1px solid #ddd', borderRadius: 6, padding: '3px 6px' }}>
                    {TASK_STATUS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {isOwner && <Btn small outline color="#e74c3c" onClick={() => del(t.id)}>ลบ</Btn>}
                </div>
              </div>
            </div>
          )
        })}
      </div>
      {showAdd && (
        <Modal title="มอบหมายงาน" onClose={() => setShowAdd(false)}>
          <Input label="ชื่องาน *" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 13, color: '#555', marginBottom: 4 }}>รายละเอียด</label>
            <textarea value={form.desc} onChange={e => setForm({ ...form, desc: e.target.value })} style={{ width: '100%', padding: '8px 10px', border: '1px solid #ddd', borderRadius: 7, fontSize: 14, boxSizing: 'border-box', minHeight: 60, resize: 'vertical' }} />
          </div>
          <Select label="มอบหมายให้" options={[{ value: '', label: '-- ทุกคน --' }, ...emps.map(e => ({ value: String(e.id), label: e.name }))]} value={form.assignTo} onChange={e => setForm({ ...form, assignTo: e.target.value })} />
          <Input label="กำหนดส่ง" type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} />
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Btn outline color="#888" onClick={() => setShowAdd(false)}>ยกเลิก</Btn>
            <Btn onClick={save} color="#e67e22">บันทึก</Btn>
          </div>
        </Modal>
      )}
    </div>
  )
}

// ==================== SCHEDULE PAGE ====================
function SchedulePage({ data, setData, currentUser }) {
  const isOwner = currentUser.role === 'owner'
  const emps = data.employees.filter(e => !e.deleted)
  const [week, setWeek] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - d.getDay()); return d.toISOString().slice(0, 10)
  })

  function getWeekDays(startStr) {
    const start = new Date(startStr)
    return Array.from({ length: 7 }, (_, i) => { const d = new Date(start); d.setDate(start.getDate() + i); return d.toISOString().slice(0, 10) })
  }
  const days = getWeekDays(week)

  function toggle(empId, date) {
    if (!isOwner) return
    const existing = data.schedules.find(s => s.empId === empId && s.date === date)
    if (existing) setData({ ...data, schedules: data.schedules.filter(s => !(s.empId === empId && s.date === date)) })
    else setData({ ...data, schedules: [...data.schedules, { empId, date }] })
  }

  function prevWeek() { const d = new Date(week); d.setDate(d.getDate() - 7); setWeek(d.toISOString().slice(0, 10)) }
  function nextWeek() { const d = new Date(week); d.setDate(d.getDate() + 7); setWeek(d.toISOString().slice(0, 10)) }

  const viewEmps = isOwner ? emps : emps.filter(e => e.id === currentUser.id)

  return (
    <div>
      <h2 style={{ margin: '0 0 16px', fontSize: 18 }}>📅 ตารางเวร</h2>
      <div style={{ background: '#fff', borderRadius: 10, padding: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <Btn small outline onClick={prevWeek}>◀</Btn>
          <span style={{ fontWeight: 600, fontSize: 14 }}>สัปดาห์ {thaiDate(week)} — {thaiDate(days[6])}</span>
          <Btn small outline onClick={nextWeek}>▶</Btn>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead><tr style={{ background: '#f5f7fa' }}>
              <th style={{ padding: '8px 10px', textAlign: 'left', minWidth: 100 }}>พนักงาน</th>
              {days.map((d, i) => <th key={d} style={{ padding: '8px 8px', textAlign: 'center', minWidth: 46, color: i === 0 || i === 6 ? '#e74c3c' : '#333' }}>{DAYS_TH[i]}<br /><span style={{ fontSize: 11, fontWeight: 400 }}>{d.slice(8)}</span></th>)}
            </tr></thead>
            <tbody>
              {viewEmps.map(emp => (
                <tr key={emp.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '8px 10px', fontWeight: 500 }}>{emp.name}</td>
                  {days.map(d => {
                    const on = data.schedules.some(s => s.empId === emp.id && s.date === d)
                    return (
                      <td key={d} style={{ padding: '6px 4px', textAlign: 'center' }}>
                        <div onClick={() => toggle(emp.id, d)} style={{ width: 32, height: 32, borderRadius: 8, margin: '0 auto', background: on ? '#1a5276' : '#f0f0f0', cursor: isOwner ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', color: on ? '#fff' : '#bbb', fontSize: 16 }}>
                          {on ? '✓' : ''}
                        </div>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {isOwner && <p style={{ fontSize: 12, color: '#aaa', marginTop: 8, textAlign: 'center' }}>คลิกช่องเพื่อเพิ่ม/ลบเวร</p>}
      </div>
    </div>
  )
}

// ==================== PAYROLL PAGE ====================
function PayrollPage({ data, currentUser }) {
  const isOwner = currentUser.role === 'owner'
  const emps = data.employees.filter(e => !e.deleted)
  const [month, setMonth] = useState(today().slice(0, 7))

  if (!isOwner) return <div style={{ textAlign: 'center', marginTop: 60, color: '#aaa' }}>🔒 เฉพาะ Owner เท่านั้น</div>

  function workedDays(empId) { return data.attendance.filter(a => a.empId === empId && monthOf(a.date) === month && a.out).length }
  function leaveDays(empId) { return data.leaves.filter(l => l.empId === empId && l.status === 'อนุมัติ' && monthOf(l.startDate) === month).length }

  const daysInMonth = new Date(month.slice(0, 4), month.slice(5, 7), 0).getDate()

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ margin: 0, fontSize: 18 }}>💰 เงินเดือน / Payroll</h2>
        <input type="month" value={month} onChange={e => setMonth(e.target.value)} style={{ border: '1px solid #ddd', borderRadius: 7, padding: '4px 8px', fontSize: 13 }} />
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, background: '#fff', borderRadius: 10, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
          <thead><tr style={{ background: '#1a5276', color: '#fff' }}>
            {['พนักงาน', 'ตำแหน่ง', 'เงินเดือน', 'วันทำงาน', 'วันลา', 'เงินที่ได้รับ'].map(h => <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600 }}>{h}</th>)}
          </tr></thead>
          <tbody>
            {emps.map((emp, i) => {
              const wd = workedDays(emp.id)
              const ld = leaveDays(emp.id)
              const dailyRate = Number(emp.salary || 0) / daysInMonth
              const earned = Math.round(dailyRate * (wd + ld))
              return (
                <tr key={emp.id} style={{ borderBottom: '1px solid #f0f0f0', background: i % 2 === 0 ? '#fff' : '#fafbfc' }}>
                  <td style={{ padding: '9px 12px', fontWeight: 500 }}>{emp.name}</td>
                  <td style={{ padding: '9px 12px', color: '#666' }}>{emp.role}</td>
                  <td style={{ padding: '9px 12px' }}>฿{fmt(emp.salary)}</td>
                  <td style={{ padding: '9px 12px', textAlign: 'center' }}>{wd}</td>
                  <td style={{ padding: '9px 12px', textAlign: 'center' }}>{ld}</td>
                  <td style={{ padding: '9px 12px', fontWeight: 600, color: '#27ae60' }}>฿{fmt(earned)}</td>
                </tr>
              )
            })}
          </tbody>
          <tfoot><tr style={{ background: '#f5f7fa', fontWeight: 600 }}>
            <td colSpan={5} style={{ padding: '9px 12px', textAlign: 'right' }}>รวมทั้งหมด</td>
            <td style={{ padding: '9px 12px', color: '#27ae60' }}>
              ฿{fmt(emps.reduce((sum, emp) => {
                const wd = workedDays(emp.id); const ld = leaveDays(emp.id)
                const dailyRate = Number(emp.salary || 0) / daysInMonth
                return sum + Math.round(dailyRate * (wd + ld))
              }, 0))}
            </td>
          </tr></tfoot>
        </table>
      </div>
      <p style={{ fontSize: 12, color: '#aaa', marginTop: 8 }}>* คำนวณจากวันที่เช็คเอาท์แล้ว + วันลาที่อนุมัติ</p>
    </div>
  )
}

// ==================== SETTINGS PAGE ====================
function SettingsPage({ currentUser, onLogout, data, setData }) {
  const [pwForm, setPwForm] = useState({ oldPw: '', newPw: '', confirmPw: '' })
  const [pwMsg, setPwMsg] = useState('')

  function changePassword() {
    const emp = data.employees.find(e => e.id === currentUser.id)
    const currentPw = emp ? emp.password : DEFAULT_OWNER.password
    if (pwForm.oldPw !== currentPw) { setPwMsg('รหัสผ่านเดิมไม่ถูกต้อง'); return }
    if (pwForm.newPw.length < 4) { setPwMsg('รหัสผ่านใหม่ต้องมีอย่างน้อย 4 ตัวอักษร'); return }
    if (pwForm.newPw !== pwForm.confirmPw) { setPwMsg('รหัสผ่านใหม่ไม่ตรงกัน'); return }
    if (currentUser.role === 'employee') {
      setData({ ...data, employees: data.employees.map(e => e.id === currentUser.id ? { ...e, password: pwForm.newPw } : e) })
    }
    setPwMsg('เปลี่ยนรหัสผ่านเรียบร้อย ✓')
    setPwForm({ oldPw: '', newPw: '', confirmPw: '' })
  }

  return (
    <div style={{ maxWidth: 480 }}>
      <h2 style={{ margin: '0 0 20px', fontSize: 18 }}>⚙️ ตั้งค่า</h2>
      <div style={{ background: '#fff', borderRadius: 10, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.07)', marginBottom: 16 }}>
        <div style={{ fontWeight: 600, marginBottom: 12 }}>👤 ข้อมูลของคุณ</div>
        <div style={{ fontSize: 14, display: 'flex', flexDirection: 'column', gap: 6, color: '#555' }}>
          <span>ชื่อ: <b style={{ color: '#333' }}>{currentUser.name}</b></span>
          <span>ชื่อผู้ใช้: <b style={{ color: '#333' }}>{currentUser.username}</b></span>
          <span>บทบาท: <b style={{ color: '#1a7be6' }}>{currentUser.role === 'owner' ? '👑 Owner' : currentUser.role}</b></span>
        </div>
      </div>
      <div style={{ background: '#fff', borderRadius: 10, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.07)', marginBottom: 16 }}>
        <div style={{ fontWeight: 600, marginBottom: 12 }}>🔑 เปลี่ยนรหัสผ่าน</div>
        <Input label="รหัสผ่านเดิม" type="password" value={pwForm.oldPw} onChange={e => setPwForm({ ...pwForm, oldPw: e.target.value })} />
        <Input label="รหัสผ่านใหม่" type="password" value={pwForm.newPw} onChange={e => setPwForm({ ...pwForm, newPw: e.target.value })} />
        <Input label="ยืนยันรหัสผ่านใหม่" type="password" value={pwForm.confirmPw} onChange={e => setPwForm({ ...pwForm, confirmPw: e.target.value })} />
        {pwMsg && <p style={{ fontSize: 13, color: pwMsg.includes('✓') ? '#27ae60' : '#e74c3c', margin: '0 0 8px' }}>{pwMsg}</p>}
        <Btn onClick={changePassword} color="#1a5276">เปลี่ยนรหัสผ่าน</Btn>
      </div>
      <Btn color="#e74c3c" onClick={onLogout}>ออกจากระบบ</Btn>
    </div>
  )
}

// ==================== MAIN APP ====================
const PAGES = [
  { id: 'employees', label: '👥 พนักงาน', ownerOnly: false },
  { id: 'attendance', label: '⏰ เช็คอิน', ownerOnly: false },
  { id: 'schedule', label: '📅 ตารางเวร', ownerOnly: false },
  { id: 'leave', label: '🏖️ การลา', ownerOnly: false },
  { id: 'tasks', label: '📋 งาน', ownerOnly: false },
  { id: 'payroll', label: '💰 เงินเดือน', ownerOnly: true },
  { id: 'settings', label: '⚙️ ตั้งค่า', ownerOnly: false },
]

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('bm_user')) } catch { return null }
  })
  const [page, setPage] = useState('employees')
  const [data, setDataRaw] = useState(() => initData(loadData()))
  const [sideOpen, setSideOpen] = useState(false)

  function setData(d) { setDataRaw(d); saveData(d) }
  function handleLogin(user) { sessionStorage.setItem('bm_user', JSON.stringify(user)); setCurrentUser(user) }
  function handleLogout() { sessionStorage.removeItem('bm_user'); setCurrentUser(null); setPage('employees') }

  if (!currentUser) return <LoginPage onLogin={handleLogin} />

  const isOwner = currentUser.role === 'owner'
  const visiblePages = PAGES.filter(p => !p.ownerOnly || isOwner)
  const pageProps = { data, setData, currentUser }

  const pageContent = {
    employees: <EmployeesPage {...pageProps} />,
    attendance: <AttendancePage {...pageProps} />,
    schedule: <SchedulePage {...pageProps} />,
    leave: <LeavePage {...pageProps} />,
    tasks: <TasksPage {...pageProps} />,
    payroll: <PayrollPage {...pageProps} />,
    settings: <SettingsPage {...pageProps} onLogout={handleLogout} />,
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4f8', fontFamily: 'Sarabun, Noto Sans Thai, sans-serif' }}>
      <div style={{ background: '#0f2942', color: '#fff', padding: '0 16px', display: 'flex', alignItems: 'center', height: 54, position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
        <button onClick={() => setSideOpen(!sideOpen)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 22, cursor: 'pointer', marginRight: 12 }}>☰</button>
        <span style={{ fontWeight: 700, fontSize: 16 }}>🏊 Blue Monte Pool Villa</span>
        <span style={{ marginLeft: 'auto', fontSize: 12, color: '#aac' }}>{currentUser.name}</span>
      </div>
      <div style={{ display: 'flex', minHeight: 'calc(100vh - 54px)' }}>
        {sideOpen && <div style={{ position: 'fixed', inset: 0, zIndex: 200 }} onClick={() => setSideOpen(false)} />}
        <div style={{ width: 220, background: '#fff', boxShadow: '2px 0 8px rgba(0,0,0,0.07)', padding: '12px 0', position: 'fixed', top: 54, bottom: 0, left: 0, transform: sideOpen ? 'translateX(0)' : 'translateX(-100%)', transition: 'transform 0.25s', zIndex: 201, overflowY: 'auto' }}>
          {visiblePages.map(p => (
            <div key={p.id} onClick={() => { setPage(p.id); setSideOpen(false) }} style={{ padding: '11px 20px', cursor: 'pointer', fontWeight: page === p.id ? 700 : 400, background: page === p.id ? '#eaf4ff' : 'transparent', color: page === p.id ? '#1a5276' : '#333', borderLeft: page === p.id ? '4px solid #1a5276' : '4px solid transparent', fontSize: 14 }}>
              {p.label}
            </div>
          ))}
        </div>
        <div style={{ flex: 1, padding: '20px 16px 80px', maxWidth: 900, margin: '0 auto', width: '100%' }}>
          {pageContent[page]}
        </div>
      </div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
      `}</style>
    </div>
  )
}

