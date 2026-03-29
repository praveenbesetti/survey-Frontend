import React, { useState, useEffect, useCallback } from 'react';
import {
  Table, Card, Typography, Button, Space,
  Drawer, message, Popconfirm, Tag
} from 'antd';
import {
  FileTextOutlined, EditOutlined,
  EyeOutlined, DeleteOutlined, ReloadOutlined,
  CloseOutlined, SaveOutlined, SearchOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { Title, Text } = Typography;

const CONS_ITEMS = [
  { key: 'rice',        label: 'Rice',           unit: ' /kg',     icon: '🌾' },
  { key: 'wheat',       label: 'Wheat / Atta',   unit: ' /kg',      icon: '🌿' },
  { key: 'toorDal',     label: 'Toor Dal',       unit: ' /kg',      icon: '🫘' },
  { key: 'moongDal',    label: 'Moong Dal',      unit: ' /kg',      icon: '🫘' },
  { key: 'chanaDal',    label: 'Chana Dal',      unit: ' /kg',      icon: '🫘' },
  { key: 'oil',         label: 'Cooking Oil',    unit: ' L',       icon: '🛢️' },
  { key: 'sugar',       label: 'Sugar',          unit: ' /kg',      icon: '🍬' },
  { key: 'salt',        label: 'Salt',           unit: ' /kg',      icon: '🧂' },
  { key: 'tea',         label: 'Tea Powder',     unit: ' /g',     icon: '🍵' },
  { key: 'milk',        label: 'Milk',           unit: ' /mL/day',   icon: '🥛' },
  { key: 'eggs',        label: 'Eggs',           unit: ' /pcs',    icon: '🥚' },
  { key: 'bathSoap',    label: 'Bath Soap',      unit: ' /pcs',     icon: '🧼' },
  { key: 'shampoo',     label: 'Shampoo',        unit: ' /ml',    icon: '🧴' },
  { key: 'detergent',   label: 'Detergent',      unit: ' /kg',      icon: '🧺' },
  { key: 'dishWash',    label: 'Dish Wash',      unit: ' /ml',    icon: '🍽️' },
  { key: 'toothpaste',  label: 'Toothpaste',     unit: ' /g',     icon: '🦷' },
];

function getConsRaw(c) {
  if (!c) return '';
  if (typeof c === 'object') {
    if (c.originalInput) return c.originalInput;
    if (c.value !== undefined) return String(c.value) + (c.unit ? ' ' + c.unit : '');
  }
  return String(c);
}

function parseConsumptionInput(raw = '') {
  const s = raw.trim();
  if (!s) return undefined;
  const m = s.match(/^(\d+(\.\d+)?)\s*([a-zA-Z/]*)$/);
  if (m) return { value: parseFloat(m[1]), unit: m[3] || '', originalInput: s };
  return { value: 0, unit: '', originalInput: s };
}

function fmtDate(v) {
  if (!v) return '—';
  try { return new Date(v).toLocaleString(); } catch { return v; }
}

const S = {
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '14px 20px', background: '#fff',
    borderBottom: '1px solid #e9eef5', position: 'sticky', top: 0, zIndex: 100,
  },
  headerLeft: { display: 'flex', alignItems: 'center', gap: 10 },
  headerRight: { display: 'flex', alignItems: 'center', gap: 8 },
  badge: {
    fontFamily: 'monospace', fontSize: 10, color: '#64748b',
    background: '#f1f5f9', borderRadius: 4, padding: '2px 7px',
    border: '1px solid #e2e8f0', maxWidth: 340,
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
    display: 'inline-block',
  },
  title: { fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0 },
  body: { padding: '16px 20px 40px', display: 'flex', flexDirection: 'column', gap: 14 },
  section: { background: '#fff', borderRadius: 12, border: '1px solid #e9eef5', overflow: 'hidden' },
  sectionHead: (color) => ({
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '9px 14px', background: '#fafbfc', borderBottom: '1px solid #e9eef5',
  }),
  sectionDot: (color) => ({ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }),
  sectionTitle: { fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#374151' },
  sectionBody: { padding: '14px 16px' },
  grid4: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 },
  grid3: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 },
  grid2: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 },
  consGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 },
  fieldWrap: { display: 'flex', flexDirection: 'column', gap: 4 },
  fieldLabel: { fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#94a3b8' },
  readTile: {
    fontSize: 13.5, fontWeight: 500, color: '#1e293b',
    padding: '8px 11px', background: '#f8fafc', border: '1px solid #e9eef5',
    borderRadius: 8, minHeight: 36, display: 'flex', alignItems: 'center', wordBreak: 'break-word',
  },
  readTileLocked: { background: '#f1f5f9', color: '#64748b', border: '1px solid #e2e8f0' },
  editInput: {
    fontSize: 13.5, fontWeight: 500, color: '#0f172a',
    padding: '8px 11px', background: '#fff', border: '1.5px solid #cbd5e1',
    borderRadius: 8, minHeight: 36, outline: 'none', width: '100%',
    boxSizing: 'border-box', fontFamily: 'inherit',
  },
  consCard: {
    background: '#fafbfc', border: '1px solid #e9eef5', borderRadius: 9,
    padding: '9px 11px', display: 'flex', flexDirection: 'column', gap: 5,
  },
  consTop: { display: 'flex', alignItems: 'center', gap: 5 },
  consLabel: { fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#475569' },
  consVal: { fontFamily: 'monospace', fontSize: 14, fontWeight: 700, color: '#0f172a', minHeight: 20 },
  consInput: {
    fontFamily: 'monospace', fontSize: 13, padding: '5px 8px', background: '#fff',
    border: '1.5px solid #d1d9e6', borderRadius: 6, outline: 'none', width: '100%', boxSizing: 'border-box',
  },
  nullBadge: {
    fontFamily: 'monospace', fontSize: 11, fontWeight: 600, color: '#b45309',
    background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 4, padding: '1px 6px',
  },
  emptyText: { color: '#cbd5e1', fontSize: 13 },
  monoId: { fontFamily: 'monospace', fontSize: 11, color: '#475569', wordBreak: 'break-all' },
  saveBar: {
    display: 'flex', justifyContent: 'flex-end', gap: 10,
    padding: '12px 20px 16px', borderTop: '1px solid #e9eef5',
    background: '#fff', position: 'sticky', bottom: 0, zIndex: 100,
  },
};

const ddStyle = {
  padding: '6px 10px', border: '1px solid #d9d9d9', borderRadius: 8,
  fontSize: 13, outline: 'none', flex: 1, minWidth: 110, maxWidth: 160,
  fontFamily: 'inherit', background: '#fff', cursor: 'pointer',
};

const inputStyle = {
  padding: '6px 12px', border: '1px solid #d9d9d9', borderRadius: 8,
  fontSize: 13, outline: 'none', flex: 1, minWidth: 120, maxWidth: 160, fontFamily: 'inherit',
};

function RField({ label, value, locked, mono }) {
  const tileStyle = { ...S.readTile, ...(locked ? S.readTileLocked : {}), ...(mono ? S.monoId : {}) };
  return (
    <div style={S.fieldWrap}>
      <div style={S.fieldLabel}>{label}</div>
      <div style={tileStyle}>
        {value === null ? <span style={S.nullBadge}>null</span>
          : (!value && value !== 0) ? <span style={S.emptyText}>—</span>
          : String(value)}
      </div>
    </div>
  );
}

function EField({ label, name, value, isView, onChange, type = 'text' }) {
  return (
    <div style={S.fieldWrap}>
      <div style={S.fieldLabel}>{label}</div>
      {isView ? (
        <div style={S.readTile}>
          {value === null ? <span style={S.nullBadge}>null</span>
            : (!value && value !== 0) ? <span style={S.emptyText}>—</span>
            : String(value)}
        </div>
      ) : (
        <input
          style={S.editInput} type={type} name={name} value={value ?? ''} onChange={onChange}
          onFocus={e => { e.target.style.borderColor = '#2563eb'; e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.10)'; }}
          onBlur={e  => { e.target.style.borderColor = '#cbd5e1'; e.target.style.boxShadow = 'none'; }}
        />
      )}
    </div>
  );
}

function DField({ label, name, value, isView, onChange, options = [] }) {
  if (isView) {
    return (
      <div style={S.fieldWrap}>
        <div style={S.fieldLabel}>{label}</div>
        <div style={S.readTile}>
          {value === null ? <span style={S.nullBadge}>null</span>
            : (!value && value !== 0) ? <span style={S.emptyText}>—</span>
            : String(value)}
        </div>
      </div>
    );
  }
  return (
    <div style={S.fieldWrap}>
      <div style={S.fieldLabel}>{label}</div>
      <select name={name} value={value ?? ''} onChange={onChange}
        style={{ ...S.editInput, cursor: 'pointer', paddingRight: 28 }}>
        <option value="">— select —</option>
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        {value && !options.includes(value) && <option value={value}>{value}</option>}
      </select>
    </div>
  );
}

function SecHead({ color, emoji, title }) {
  return (
    <div style={S.sectionHead(color)}>
      <span style={S.sectionDot(color)} />
      <span style={{ fontSize: 14 }}>{emoji}</span>
      <span style={S.sectionTitle}>{title}</span>
    </div>
  );
}

function SurveyPanel({ record, mode, onClose, onSaved }) {
  const [isEdit, setIsEdit] = useState(mode === 'edit');
  const [form,   setForm]   = useState({});
  const [cons,   setCons]   = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => { setIsEdit(mode === 'edit'); }, [mode]);

  useEffect(() => {
    if (!record) return;
    const rawCons = {};
    CONS_ITEMS.forEach(({ key }) => { rawCons[key] = getConsRaw(record.consumption?.[key]); });
    setForm({ ...record });
    setCons(rawCons);
  }, [record]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const parsedCons = {};
      CONS_ITEMS.forEach(({ key }) => {
        const p = parseConsumptionInput(cons[key]);
        if (p) parsedCons[key] = p;
      });
      await axios.put(`/survey-data/${record._id}`, { ...form, consumption: parsedCons });
      message.success('Survey updated successfully');
      onSaved();
    } catch {
      message.error('Failed to update survey');
    } finally {
      setSaving(false);
    }
  };

  if (!record) return null;
  const mobileArr = Array.isArray(record.mobile) ? record.mobile : (record.mobile ? [record.mobile] : []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>

      <div style={S.header}>
        <div style={S.headerLeft}>
          <div style={{ width: 34, height: 34, background: '#eff6ff', color: '#2563eb', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
            📋
          </div>
          <div>
            <div style={S.title}>{isEdit ? 'Edit Survey' : 'Survey Details'}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
              {record.surveyId && <div style={S.badge}>{record.surveyId}</div>}
              {record.createdAt && (
                <div style={{ ...S.badge, color: '#0f766e', background: '#f0fdf4', borderColor: '#bbf7d0' }}>
                  📅 {fmtDate(record.createdAt)}
                </div>
              )}
            </div>
          </div>
        </div>
        <div style={S.headerRight}>
          {!isEdit && (
            <Button size="small" type="primary" ghost icon={<EditOutlined />} onClick={() => setIsEdit(true)}>Edit</Button>
          )}
          {isEdit && (
            <Button size="small" onClick={() => setIsEdit(false)}>Cancel</Button>
          )}
          <Button size="small" icon={<CloseOutlined />} onClick={onClose} />
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div style={S.body}>

          <div style={S.section}>
            <SecHead color="#3b82f6" emoji="📍" title="Location" />
            <div style={S.sectionBody}>
              <div style={S.grid4}>
                <RField label="State"    value={record.stateName}    locked />
                <RField label="District" value={record.districtName} locked />
                <RField label="Mandal"   value={record.MandalName}   locked />
                <RField label="Village"  value={record.VillageName}  locked />
              </div>
              <div style={{ ...S.grid3, marginTop: 12 }}>
                <EField label="Ward / Area" name="wardArea"   value={form.wardArea}   isView={!isEdit} onChange={handleChange} />
                
                <RField label="Surveyor ID" value={record.surveyorId} locked mono />
              </div>
            </div>
          </div>

          <div style={S.section}>
            <SecHead color="#8b5cf6" emoji="🪪" title="Identity & Contact" />
            <div style={S.sectionBody}>
              <div style={S.grid3}>
                <EField label="Family Head" name="familyHead" value={form.familyHead} isView={!isEdit} onChange={handleChange} />
                <EField label="Door No."    name="doorNumber" value={form.doorNumber} isView={!isEdit} onChange={handleChange} />
                <div style={S.fieldWrap}>
                  <div style={S.fieldLabel}>📞 Mobile Numbers</div>
                  <div style={{ ...S.readTile, flexWrap: 'wrap', gap: 6, minHeight: 36 }}>
                    {mobileArr.length === 0
                      ? <span style={S.emptyText}>—</span>
                      : mobileArr.map((n, i) => (
                          <Tag key={i} color="blue" style={{ margin: 0, fontFamily: 'monospace' }}>{n}</Tag>
                        ))
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style={S.section}>
            <SecHead color="#10b981" emoji="🏠" title="Household Profile" />
            <div style={S.sectionBody}>
              <div style={S.grid3}>
                <EField label="Family Members" name="familyMembers" type="number" value={form.familyMembers} isView={!isEdit} onChange={handleChange} />
                <EField label="Family Type"    name="familyType"    value={form.familyType}    isView={!isEdit} onChange={handleChange} />
                <EField label="Occupation"     name="occupation"    value={form.occupation}    isView={!isEdit} onChange={handleChange} />
              </div>
            </div>
          </div>

          <div style={S.section}>
            <SecHead color="#f59e0b" emoji="🛒" title="Monthly Consumption" />
            <div style={S.sectionBody}>
              <div style={S.consGrid}>
                {CONS_ITEMS.map(item => {
                  const raw   = cons[item.key];
                  const dbObj = record.consumption?.[item.key];
                  return (
                    <div key={item.key} style={S.consCard}>
                      <div style={S.consTop}>
                        <span style={{ fontSize: 14 }}>{item.icon}</span>
                        <span style={S.consLabel}>{item.label} {item.unit}</span>
                      </div>
                      {!isEdit ? (
                        <div style={S.consVal}>
                          {!raw ? <span style={S.emptyText}>—</span>
                            : <><span>{dbObj?.value ?? raw}</span>{dbObj?.unit && <span style={{ fontSize: 11, color: '#64748b', fontWeight: 400 }}> {dbObj.unit}</span>}</>
                          }
                        </div>
                      ) : (
                        <input style={S.consInput} value={raw ?? ''} placeholder="e.g. 2kg"
                          onChange={e => setCons(p => ({ ...p, [item.key]: e.target.value }))} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div style={S.section}>
            <SecHead color="#ec4899" emoji="📊" title="Shopping Preferences" />
            <div style={S.sectionBody}>
              <div style={S.grid3}>
                <DField label="Grocery Source"     name="grocerySource"     value={form.grocerySource}     isView={!isEdit} onChange={handleChange} options={['Local Kirana', 'Local Kirana shop', 'Weekly market', 'Town supermarket', 'Online']} />
                <DField label="Monthly Spending"   name="monthlySpending"   value={form.monthlySpending}   isView={!isEdit} onChange={handleChange} options={['2000-3000', '3000-5000']} />
                <DField label="Purchase Frequency" name="purchaseFrequency" value={form.purchaseFrequency} isView={!isEdit} onChange={handleChange} options={['Daily', 'Weekly', 'Once a month']} />
                <DField label="Branded Preference" name="brandedPreference" value={form.brandedPreference} isView={!isEdit} onChange={handleChange} options={['Yes', 'No', 'Sometimes']} />
                <DField label="Product Type"       name="productType"       value={form.productType}       isView={!isEdit} onChange={handleChange} options={['Loose products', 'Packaged products']} />
                <DField label="Digital Supermarket" name="cheaperOption"    value={form.cheaperOption}     isView={!isEdit} onChange={handleChange} options={['Yes', 'No']} />
                
              </div>
            </div>
          </div>

        </div>
      </div>

      {isEdit && (
        <div style={S.saveBar}>
          <Button onClick={() => setIsEdit(false)}>Cancel</Button>
          <Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={handleSave}>Save Changes</Button>
        </div>
      )}
    </div>
  );
}

export const SurveyManager = () => {
  const [data,       setData]       = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 50, total: 0 });

  const [states,     setStates]     = useState([]);
  const [districts,  setDistricts]  = useState([]);
  const [mandals,    setMandals]    = useState([]);
  const [villages,   setVillages]   = useState([]);
  const [geoLoading, setGeoLoading] = useState({ state: false, dist: false, mandal: false, village: false });

  // Filter and Search States
  const [searchType, setSearchType] = useState('familyHead');
  const [searchValue, setSearchValue] = useState('');
  const [filters, setFilters] = useState({
    surveyId: '', stateName: '', districtName: '', MandalName: '', VillageName: '', search: ''
  });

  const [drawerOpen,     setDrawerOpen]     = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [drawerMode,     setDrawerMode]     = useState('view');

  useEffect(() => {
    setGeoLoading(p => ({ ...p, state: true }));
    axios.get('/states')
      .then(res => setStates(res.data.data || res.data))
      .finally(() => setGeoLoading(p => ({ ...p, state: false })));
  }, []);

  const handleStateChange = (val, name) => {
    const stateName = val ? name : '';
    setFilters(p => ({ ...p, stateName, districtName: '', MandalName: '', VillageName: '' }));
    setDistricts([]); setMandals([]); setVillages([]);
    if (!val) return;
    setGeoLoading(p => ({ ...p, dist: true }));
    axios.get(`/districts/state/${val}`)
      .then(res => setDistricts(res.data.data || res.data))
      .finally(() => setGeoLoading(p => ({ ...p, dist: false })));
  };

  const handleDistrictChange = (val, name) => {
    const distName = val ? name : '';
    setFilters(p => ({ ...p, districtName: distName, MandalName: '', VillageName: '' }));
    setMandals([]); setVillages([]);
    if (!val) return;
    setGeoLoading(p => ({ ...p, mandal: true }));
    axios.get(`/mandals/agent/${val}`)
      .then(res => setMandals(res.data.data || res.data))
      .finally(() => setGeoLoading(p => ({ ...p, mandal: false })));
  };

  const handleMandalChange = (val, name) => {
    const mandName = val ? name : '';
    setFilters(p => ({ ...p, MandalName: mandName, VillageName: '' }));
    setVillages([]);
    if (!val) return;
    setGeoLoading(p => ({ ...p, village: true }));
    axios.get(`/villages/mandal/${val}`)
      .then(res => setVillages(res.data.data || res.data))
      .finally(() => setGeoLoading(p => ({ ...p, village: false })));
  };

  const fetchSurveys = async (f = filters) => {
    setLoading(true);
    try {
        const res = await axios.get('/survey-data/surveyData', {
            params: {
                page: pagination.current,
                limit: pagination.pageSize,
                stateName: f.stateName || undefined,
                districtName: f.districtName || undefined,
                mandalName: f.MandalName || undefined,
                villageName: f.VillageName || undefined,
                
                // FIXED: Pass BOTH search and searchType
                search: searchValue || undefined, 
                searchType: searchType || undefined, 
            }
        });
        setData(res.data.data || res.data || []);
        setPagination(prev => ({ ...prev, total: res.data.total || 0 }));
    } catch {
        message.error('Failed to fetch surveys');
    } finally {
        setLoading(false);
    }
};

  useEffect(() => { fetchSurveys(filters); }, [pagination.current, pagination.pageSize]);

  const openDrawer  = (record, mode) => { setSelectedRecord(record); setDrawerMode(mode); setDrawerOpen(true); };
  const closeDrawer = () => { setDrawerOpen(false); setSelectedRecord(null); };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/survey-data/${id}`);
      message.success('Survey deleted');
      fetchSurveys(filters);
    } catch {
      message.error('Delete failed');
    }
  };

  const columns = [
    {
      title: 'Survey ID', dataIndex: 'surveyId', key: 'surveyId',
      fixed: 'left', width: 180, ellipsis: true,
      render: v => <Text code style={{ fontSize: 11, color: '#2563eb' }}>{v || '—'}</Text>
    },
    { title: 'Family Head', dataIndex: 'familyHead',   key: 'familyHead',   width: 130 },
    { title: 'Village',     dataIndex: 'VillageName',  key: 'VillageName',  width: 120 },
    { title: 'Mandal',      dataIndex: 'MandalName',   key: 'MandalName',   width: 120 },
    { title: 'District',    dataIndex: 'districtName', key: 'districtName', width: 120 },
    {
      title: 'Mobile', dataIndex: 'mobile', key: 'mobile', width: 130,
      render: m => Array.isArray(m) ? m.join(', ') : (m || '—')
    },
    { title: 'Date', dataIndex: 'surveyDate', key: 'surveyDate', width: 100 },
    {
      title: 'Created At', dataIndex: 'createdAt', key: 'createdAt', width: 150,
      render: v => <span style={{ fontSize: 12, color: '#64748b' }}>{fmtDate(v)}</span>
    },
    {
      title: 'Actions', key: 'action', fixed: 'right', width: 120,
      render: (_, record) => (
        <Space size={4}>
          <Button size="small" icon={<EyeOutlined />}  onClick={() => openDrawer(record, 'view')} />
          <Button size="small" type="primary" ghost icon={<EditOutlined />} onClick={() => openDrawer(record, 'edit')} />
          <Popconfirm
            title="Delete this survey?"
            onConfirm={() => handleDelete(record._id)}
            okText="Delete" cancelText="Cancel" okButtonProps={{ danger: true }}
          >
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: 24, background: '#f5f7fa', minHeight: '100vh' }}>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>
          <FileTextOutlined style={{ marginRight: 8, color: '#2563eb' }} />
          Survey Management
        </Title>
        <Button icon={<ReloadOutlined />} onClick={() => fetchSurveys(filters)}>Refresh</Button>
      </div>

      <Card style={{ borderRadius: 12, marginBottom: 16 }} styles={{ body: { padding: '12px 16px' } }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>

          {/* Combined Search Options */}
          <div style={{ display: 'flex', background: '#fff', border: '1px solid #d9d9d9', borderRadius: 8, overflow: 'hidden', flex: 1, minWidth: 300, maxWidth: 450 }}>
            <select 
              value={searchType} 
              onChange={e => setSearchType(e.target.value)}
              style={{ padding: '0 10px', border: 'none', background: '#f8fafc', borderRight: '1px solid #d9d9d9', fontSize: 13, outline: 'none', cursor: 'pointer' }}
            >
             
              <option value="surveyId">Survey ID </option>
              <option value="surveyorId">surveyor ID</option>
              
            </select>
            <input
              style={{ flex: 1, padding: '6px 12px', border: 'none', fontSize: 13, outline: 'none' }}
              placeholder={`Search by ${searchType}...`}
              value={searchValue}
              onChange={e => setSearchValue(e.target.value)}
            />
            <div style={{ padding: '0 12px', display: 'flex', alignItems: 'center', color: '#94a3b8' }}>
              <SearchOutlined />
            </div>
          </div>

          <select style={ddStyle} onChange={e => handleStateChange(e.target.value, e.target.options[e.target.selectedIndex].text)}>
            <option value="">{geoLoading.state ? 'Loading...' : 'State'}</option>
            {states.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>

          <select style={ddStyle} onChange={e => handleDistrictChange(e.target.value, e.target.options[e.target.selectedIndex].text)} disabled={!districts.length}>
            <option value="">{geoLoading.dist ? 'Loading...' : 'District'}</option>
            {districts.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
          </select>

          <select style={ddStyle} onChange={e => handleMandalChange(e.target.value, e.target.options[e.target.selectedIndex].text)} disabled={!mandals.length}>
            <option value="">{geoLoading.mandal ? 'Loading...' : 'Mandal'}</option>
            {mandals.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
          </select>

          <select style={ddStyle} onChange={e => setFilters(p => ({ ...p, VillageName: e.target.options[e.target.selectedIndex].text === "Village" ? "" : e.target.options[e.target.selectedIndex].text }))} disabled={!villages.length}>
            <option value="">{geoLoading.village ? 'Loading...' : 'Village'}</option>
            {villages.map(v => <option key={v._id} value={v._id}>{v.name}</option>)}
          </select>

          <Button type="primary" onClick={() => { setPagination(p => ({ ...p, current: 1 })); fetchSurveys(filters); }}>
            Apply
          </Button>
          <Button onClick={() => {
            setSearchValue('');
            setFilters({ stateName: '', districtName: '', MandalName: '', VillageName: '' });
            setDistricts([]); setMandals([]); setVillages([]);
            fetchSurveys({ stateName: '', districtName: '', MandalName: '', VillageName: '' });
          }}>
            Clear
          </Button>
          <Text type="secondary" style={{ fontSize: 12, marginLeft: 'auto' }}>
            {pagination.total} total
          </Text>

        </div>
      </Card>

      <Card styles={{ body: { padding: 0 } }} style={{ borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 8px rgba(0,0,0,0.07)' }}>
        <Table
          columns={columns}
          dataSource={data}
          rowKey="_id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            pageSizeOptions: ['50', '100', '200'],
          }}
          onChange={p => setPagination(prev => ({ ...prev, current: p.current, pageSize: p.pageSize }))}
          scroll={{ x: 1100 }}
          size="middle"
        />
      </Card>

      <Drawer open={drawerOpen} onClose={closeDrawer} width={860} closable={false} destroyOnClose styles={{ body: { padding: 0, background: '#f8fafc' } }}>
        {selectedRecord && (
          <SurveyPanel
            key={selectedRecord._id}
            record={selectedRecord}
            mode={drawerMode}
            onClose={closeDrawer}
            onSaved={() => { closeDrawer(); fetchSurveys(filters); }}
          />
        )}
      </Drawer>

    </div>
  );
};