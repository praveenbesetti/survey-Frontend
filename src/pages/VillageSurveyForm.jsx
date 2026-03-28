import React, { useState, useEffect } from 'react';
import { ClipboardCheck, CheckCircle, X, Edit3, Eye, Save, Loader2, Hash, Calendar, Phone, MapPin, User, Home, ShoppingCart, BarChart3, Info, FileText } from 'lucide-react';
import styles from './VillageSurveyForm.module.css';
import axios from 'axios';

// ─── SAFE REDUX SELECTOR ──────────────────────────────────────────────────────
// VillageSurveyForm is used in TWO contexts:
//   1. Standalone survey page — inside Redux <Provider>, useSelector works fine
//   2. Admin modal/drawer    — rendered OUTSIDE the Redux <Provider> portal
//      → crashes with "could not find react-redux context value"
// Solution: lazy-require useSelector and catch the context error gracefully.
// In admin mode agentData is never needed (surveyorId comes from initialData).
function useSafeAgentData() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { useSelector } = require('react-redux');
    // useSelector is called inside try — if context is missing React throws,
    // which we catch and return the fallback.
    return useSelector((state) => state.auth?.user || {});
  } catch {
    return {};
  }
}

// ─── TRANSLATIONS ─────────────────────────────────────────────────────────────
const T = {
  en: {
    // Titles
    pageTitle: 'Village Survey',
    viewTitle: 'Survey Details',
    editTitle: 'Edit Survey',
    // Sections
    secLocation: 'Location',
    secIdentity: 'Identity & Contact',
    secHousehold: 'Household Profile',
    secConsumption: 'Monthly Consumption',
    secPreferences: 'Shopping Preferences',
    secMeta: 'Record Info',
    secExtra: 'Additional Fields',
    // Location
    state: 'State', district: 'District', mandal: 'Mandal', village: 'Village',
    selectState: 'Select State', selectDistrict: 'Select District',
    selectMandal: 'Select Mandal', selectVillage: 'Select Village',
    loadingText: 'Loading…',
    wardArea: 'Ward / Area Name *', wardPlaceholder: 'Enter ward or area name',
    surveyDate: 'Survey Date', surveyorId: 'Surveyor ID', villageId: 'Village ID',
    // Identity
    doorNumber: 'House Door Number *', doorPlaceholder: 'e.g. 12-34',
    familyHead: 'Family Head Name *', familyHeadPlaceholder: 'Full name',
    mobileNumbers: 'Mobile Numbers', mobilePlaceholder: 'Mobile',
    addMobile: '+ Add', removeMobile: 'Remove',
    // Household
    familyMembers: 'Total Family Members *', familyMembersPlaceholder: 'e.g. 4',
    familyType: 'Family Type *', selectType: 'Select type',
    nuclear: 'Nuclear Family', joint: 'Joint Family',
    occupation: 'Occupation *', selectOccupation: 'Select occupation',
    farming: 'Farming', dailyWage: 'Daily wage worker',
    privateJob: 'Private job', govtJob: 'Government job',
    business: 'Business', other: 'Other',
    // Consumption
    consumptionHint: 'Specify quantity with unit — e.g. 10 kg, 2 L, 1 dozen',
    // Preferences
    grocerySource: 'Grocery Source *', selectSource: 'Select source',
    localKirana: 'Local Kirana shop', weeklyMarket: 'Weekly market',
    townSuper: 'Town supermarket', online: 'Online',
    monthlySpend: 'Monthly Spend (₹) *', selectRange: 'Select range',
    spend1: '₹2,000 – ₹3,000', spend2: '₹3,000 – ₹5,000', spend3: 'More than ₹5,000',
    exactAmount: 'Enter exact amount (₹)',
    purchaseFreq: 'Purchase Frequency *', selectFreq: 'Select frequency',
    daily: 'Daily', weekly: 'Weekly', monthly: 'Once a month',
    brandedPref: 'Prefer Branded Products? *', selectPref: 'Select preference',
    yes: 'Yes', no: 'No', sometimes: 'Sometimes',
    productType: 'Loose vs Packaged? *', selectPType: 'Select type',
    loose: 'Loose products', packaged: 'Packaged products',
    digitalSuper: 'Open to Digital Supermarket? *', selectOption: 'Select option',
    orderMethod: 'Order Method',
    // Buttons
    submitBtn: '📤  Submit Survey', submitting: 'Syncing Survey…',
    saveBtn: 'Save Changes', saving: 'Saving…',
    editBtn: 'Edit', cancelBtn: 'Cancel',
    // Success
    successTitle: 'Survey Submitted!',
    successSub: 'Data has been synced successfully.',
    newSurvey: '+ Start New Survey',
    // Meta
    dbId: 'DB ID', createdAt: 'Created At', updatedAt: 'Updated At',
    // Errors
    errVillage: 'Please select a Village',
    errFamilyHead: 'Family Head Name is required',
    errWardArea: 'Ward / Area Name is required',
    errDoorNumber: 'House Door Number is required',
    errMobileMin: 'At least one valid mobile number is required',
    errMobileInvalid: 'Mobile number must be 10 digits starting with 6-9',
    errFamilyMembers: 'Family Members count is required',
    errFamilyType: 'Family Type is required',
    errOccupation: 'Occupation is required',
    errGrocerySource: 'Grocery Source is required',
    errMonthlySpending: 'Monthly Spending range is required',
    errMonthlySpendingCustom: 'Please enter exact amount',
    errConsumption: 'Please fill in at least one item in Monthly Consumption',
    errPurchaseFreq: 'Purchase Frequency is required',
    errBrandedPref: 'Branded Preference is required',
    errProductType: 'Product Type is required',
    errDigitalSuper: 'Please select Digital Supermarket preference',
    errServer: 'Submission failed: ',
    updateSuccess: 'Survey updated successfully',
    updateError: 'Failed to update survey',
  },
  te: {
    pageTitle: 'గ్రామ సర్వే',
    viewTitle: 'సర్వే వివరాలు',
    editTitle: 'సర్వే సవరించు',
    secLocation: 'స్థానం', secIdentity: 'గుర్తింపు & సంప్రదింపు',
    secHousehold: 'కుటుంబ వివరాలు', secConsumption: 'నెలవారీ వినియోగం',
    secPreferences: 'షాపింగ్ ప్రాధాన్యతలు', secMeta: 'రికార్డ్ సమాచారం',
    secExtra: 'అదనపు ఫీల్డ్లు',
    state: 'రాష్ట్రం', district: 'జిల్లా', mandal: 'మండలం', village: 'గ్రామం',
    selectState: 'రాష్ట్రం ఎంచుకోండి', selectDistrict: 'జిల్లా ఎంచుకోండి',
    selectMandal: 'మండలం ఎంచుకోండి', selectVillage: 'గ్రామం ఎంచుకోండి',
    loadingText: 'లోడవుతోంది…',
    wardArea: 'వార్డు / ప్రాంతం పేరు *', wardPlaceholder: 'వార్డు లేదా ప్రాంతం పేరు',
    surveyDate: 'సర్వే తేదీ', surveyorId: 'సర్వేయర్ ID', villageId: 'గ్రామం ID',
    doorNumber: 'ఇంటి నంబర్ *', doorPlaceholder: 'ఉదా. 12-34',
    familyHead: 'కుటుంబ పెద్ద పేరు *', familyHeadPlaceholder: 'పూర్తి పేరు',
    mobileNumbers: 'మొబైల్ నంబర్లు', mobilePlaceholder: 'మొబైల్',
    addMobile: '+ జోడించు', removeMobile: 'తొలగించు',
    familyMembers: 'మొత్తం కుటుంబ సభ్యులు *', familyMembersPlaceholder: 'ఉదా. 4',
    familyType: 'కుటుంబ రకం *', selectType: 'రకం ఎంచుకోండి',
    nuclear: 'న్యూక్లియర్ కుటుంబం', joint: 'సంయుక్త కుటుంబం',
    occupation: 'వృత్తి *', selectOccupation: 'వృత్తి ఎంచుకోండి',
    farming: 'వ్యవసాయం', dailyWage: 'రోజువారీ వేతన కార్మికుడు',
    privateJob: 'ప్రైవేట్ ఉద్యోగం', govtJob: 'ప్రభుత్వ ఉద్యోగం',
    business: 'వ్యాపారం', other: 'ఇతర',
    consumptionHint: 'పరిమాణం మరియు యూనిట్ తో నమోదు చేయండి — ఉదా. 10 kg, 2 L, 1 డజన్',
    grocerySource: 'కిరాణా వనరు *', selectSource: 'వనరు ఎంచుకోండి',
    localKirana: 'స్థానిక కిరాణా దుకాణం', weeklyMarket: 'వారపు సంత',
    townSuper: 'పట్టణ సూపర్‌మార్కెట్', online: 'ఆన్‌లైన్',
    monthlySpend: 'నెలవారీ ఖర్చు (₹) *', selectRange: 'పరిధి ఎంచుకోండి',
    spend1: '₹2,000 – ₹3,000', spend2: '₹3,000 – ₹5,000', spend3: '₹5,000 కంటే ఎక్కువ',
    exactAmount: 'సరిగ్గా మొత్తం నమోదు చేయండి (₹)',
    purchaseFreq: 'కొనుగోలు పౌనఃపున్యం *', selectFreq: 'పౌనఃపున్యం ఎంచుకోండి',
    daily: 'రోజూ', weekly: 'వారానికి', monthly: 'నెలకు ఒకసారి',
    brandedPref: 'బ్రాండెడ్ ఉత్పత్తులు ఇష్టమా? *', selectPref: 'ప్రాధాన్యత ఎంచుకోండి',
    yes: 'అవును', no: 'కాదు', sometimes: 'కొన్నిసార్లు',
    productType: 'వదులుగా vs ప్యాక్ చేసినది? *', selectPType: 'రకం ఎంచుకోండి',
    loose: 'వదులు ఉత్పత్తులు', packaged: 'ప్యాక్ ఉత్పత్తులు',
    digitalSuper: 'డిజిటల్ సూపర్‌మార్కెట్‌కు సిద్ధంగా ఉన్నారా? *', selectOption: 'ఎంపిక చేయండి',
    orderMethod: 'ఆర్డర్ పద్ధతి',
    submitBtn: '📤  సర్వే సమర్పించు', submitting: 'సమర్పిస్తోంది…',
    saveBtn: 'సేవ్ చేయండి', saving: 'సేవ్ అవుతోంది…',
    editBtn: 'సవరించు', cancelBtn: 'రద్దు చేయి',
    successTitle: 'సర్వే సమర్పించబడింది!',
    successSub: 'డేటా విజయవంతంగా సేవ్ అయింది.',
    newSurvey: '+ కొత్త సర్వే',
    dbId: 'DB ID', createdAt: 'సృష్టించిన తేదీ', updatedAt: 'అప్‌డేట్ తేదీ',
    errVillage: 'దయచేసి గ్రామం ఎంచుకోండి',
    errFamilyHead: 'కుటుంబ పెద్ద పేరు అవసరం',
    errWardArea: 'వార్డు / ప్రాంతం పేరు అవసరం',
    errDoorNumber: 'ఇంటి నంబర్ అవసరం',
    errMobileMin: 'కనీసం ఒక చెల్లుబాటు అయ్యే మొబైల్ నంబర్ అవసరం',
    errMobileInvalid: 'మొబైల్ నంబర్ 6-9 తో మొదలయ్యే 10 అంకెలు ఉండాలి',
    errFamilyMembers: 'కుటుంబ సభ్యుల సంఖ్య అవసరం',
    errFamilyType: 'కుటుంబ రకం అవసరం',
    errOccupation: 'వృత్తి అవసరం',
    errGrocerySource: 'కిరాణా వనరు అవసరం',
    errMonthlySpending: 'నెలవారీ ఖర్చు పరిధి అవసరం',
    errMonthlySpendingCustom: 'సరిగ్గా మొత్తం నమోదు చేయండి',
    errConsumption: 'దయచేసి నెలవారీ వినియోగంలో కనీసం ఒక వస్తువు నింపండి',
    errPurchaseFreq: 'కొనుగోలు పౌనఃపున్యం అవసరం',
    errBrandedPref: 'బ్రాండెడ్ ప్రాధాన్యత అవసరం',
    errProductType: 'ఉత్పత్తి రకం అవసరం',
    errDigitalSuper: 'డిజిటల్ సూపర్‌మార్కెట్ ప్రాధాన్యత ఎంచుకోండి',
    errServer: 'సమర్పణ విఫలమైంది: ',
    updateSuccess: 'సర్వే విజయవంతంగా అప్‌డేట్ అయింది',
    updateError: 'అప్‌డేట్ విఫలమైంది',
  }
};

// ─── CONSUMPTION ITEMS ────────────────────────────────────────────────────────
const consumptionItems = [
  { key: 'rice',       label: { en: 'Rice',             te: 'బియ్యం' },       icon: '🌾', ph: { en: '10 kg',   te: '10 kg' } },
  { key: 'wheat',      label: { en: 'Wheat / Atta',     te: 'గోధుమ / ఆటా' },  icon: '🌿', ph: { en: '5 kg',    te: '5 kg' } },
  { key: 'toorDal',    label: { en: 'Toor Dal',         te: 'కంది పప్పు' },   icon: '🫘', ph: { en: '2 kg',    te: '2 kg' } },
  { key: 'moongDal',   label: { en: 'Moong Dal',        te: 'పెసర పప్పు' },   icon: '🫘', ph: { en: '1 kg',    te: '1 kg' } },
  { key: 'chanaDal',   label: { en: 'Chana Dal',        te: 'శనగ పప్పు' },    icon: '🫘', ph: { en: '1 kg',    te: '1 kg' } },
  { key: 'oil',        label: { en: 'Cooking Oil',      te: 'నూనె' },         icon: '🛢️', ph: { en: '2 L',     te: '2 L' } },
  { key: 'sugar',      label: { en: 'Sugar',            te: 'చక్కెర' },       icon: '🍬', ph: { en: '2 kg',    te: '2 kg' } },
  { key: 'salt',       label: { en: 'Salt',             te: 'ఉప్పు' },        icon: '🧂', ph: { en: '1 kg',    te: '1 kg' } },
  { key: 'tea',        label: { en: 'Tea Powder',       te: 'టీ పొడి' },      icon: '🍵', ph: { en: '250 g',   te: '250 g' } },
  { key: 'milk',       label: { en: 'Milk',             te: 'పాలు' },         icon: '🥛', ph: { en: '1 L/day', te: '1 L/రోజు' } },
  { key: 'eggs',       label: { en: 'Eggs',             te: 'గుడ్లు' },       icon: '🥚', ph: { en: '30 pcs',  te: '30 పీస్' } },
  { key: 'bathSoap',   label: { en: 'Bath Soap',        te: 'స్నాన సబ్బు' },  icon: '🧼', ph: { en: '4 pcs',   te: '4 పీస్' } },
  { key: 'shampoo',    label: { en: 'Shampoo',          te: 'షాంపూ' },        icon: '🧴', ph: { en: '400 ml',  te: '400 ml' } },
  { key: 'detergent',  label: { en: 'Detergent Powder', te: 'డిటర్జెంట్' },   icon: '🧺', ph: { en: '1 kg',    te: '1 kg' } },
  { key: 'dishWash',   label: { en: 'Dish Wash',        te: 'పాత్రల సబ్బు' }, icon: '🍽️', ph: { en: '500 ml',  te: '500 ml' } },
  { key: 'toothpaste', label: { en: 'Toothpaste',       te: 'టూత్‌పేస్ట్' },  icon: '🦷', ph: { en: '150 g',   te: '150 g' } },
];

// Keys explicitly handled in sections — anything else goes to "Extra"
const HANDLED_KEYS = new Set([
  '_id', 'surveyId', 'surveyorId',
  'stateName', 'districtName', 'MandalName', 'VillageName', 'villageId',
  'wardArea', 'surveyDate',
  'familyHead', 'doorNumber', 'mobile',
  'familyMembers', 'familyType', 'occupation',
  'consumption',
  'grocerySource', 'monthlySpending', 'purchaseFrequency',
  'brandedPreference', 'productType', 'cheaperOption', 'orderMethod',
  'createdAt', 'updatedAt', '__v',
]);

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function parseConsumptionInput(raw = '') {
  const trimmed = (raw ?? '').toString().trim();
  if (!trimmed) return undefined;
  const match = trimmed.match(/^(\d+(\.\d+)?)\s*([a-zA-Z/]*)$/);
  if (match) return { value: parseFloat(match[1]), unit: match[3] || '', originalInput: trimmed };
  return { value: 0, unit: '', originalInput: trimmed };
}

function fmtDate(v) {
  if (!v) return v;
  try { return new Date(v).toLocaleString(); } catch { return v; }
}

// Extract raw string from DB consumption object
function extractConsRaw(c) {
  if (c === null || c === undefined) return '';
  if (typeof c === 'object') {
    return c.originalInput ?? (c.value !== undefined
      ? String(c.value) + (c.unit ? ' ' + c.unit : '')
      : '');
  }
  return String(c);
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
/**
 * Props:
 *   initialData  — existing survey object (admin view/edit). If absent → create-new mode.
 *   mode         — 'view' | 'edit' (only relevant when initialData provided)
 *   onFinished   — called after successful update (admin modal close)
 *   onClose      — called when X is clicked (admin modal close)
 *
 * When used standalone (no initialData), behaves exactly like the original
 * create-new survey form with useSelector for agentData.
 */
export default function VillageSurveyForm({ initialData, mode = 'view', onFinished, onClose } = {}) {
  const agentData = useSafeAgentData();

  const isAdminMode = !!initialData;          // admin view/edit
  const [lang, setLang] = useState('en');
  const t = T[lang];

  // In admin mode: track view vs edit
  const [currentMode, setCurrentMode] = useState(mode);
  const isViewOnly = isAdminMode && currentMode === 'view';

  // ── Location dropdowns (create mode only) ──
  const [states,    setStates]    = useState([]);
  const [districts, setDistricts] = useState([]);
  const [mandals,   setMandals]   = useState([]);
  const [villages,  setVillages]  = useState([]);
  const [loading,   setLoading]   = useState({ state: false, dist: false, mandal: false, village: false });
  const [selection, setSelection] = useState({
    stateName: '', districtName: '', mandalName: '', villageName: '',
    stateId: '', districtId: '', mandalId: '', villageId: '',
  });

  // ── Form state ──
  const [form, setForm] = useState({
    wardArea: '', doorNumber: '', familyHead: '',
    familyMembers: '', familyType: '', occupation: '',
    grocerySource: '', monthlySpending: '', monthlySpendingCustom: '',
    purchaseFrequency: '', brandedPreference: '', productType: '',
    cheaperOption: '', orderMethod: '', consumption: {},
    otherProduct: '', surveyorNote: '',
  });
  const [mobileNumbers, setMobileNumbers] = useState(['']);
  const [fieldErrors,   setFieldErrors]   = useState({});
  const [isSubmitting,  setIsSubmitting]  = useState(false);
  const [isSubmitted,   setIsSubmitted]   = useState(false);
  const [serverError,   setServerError]   = useState('');
  const [toast,         setToast]         = useState(null);

  // ── Populate from initialData (admin mode) ──
  useEffect(() => {
    if (!initialData) return;
    const rawCons = {};
    consumptionItems.forEach(({ key }) => {
      rawCons[key] = extractConsRaw(initialData.consumption?.[key]);
    });
    setForm({ ...initialData, consumption: rawCons });
    setMobileNumbers(
      Array.isArray(initialData.mobile) && initialData.mobile.length
        ? initialData.mobile : ['']
    );
  }, [initialData]);

  useEffect(() => { setCurrentMode(mode); }, [mode]);

  // ── Load states (create mode) ──
  useEffect(() => {
    if (isAdminMode) return;
    setLoading(p => ({ ...p, state: true }));
    axios.get('/states')
      .then(res => setStates(res.data.data || res.data))
      .finally(() => setLoading(p => ({ ...p, state: false })));
  }, [isAdminMode]);

  // ── Handlers ──
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleConsumptionChange = (key, value) => {
    setForm(prev => ({ ...prev, consumption: { ...prev.consumption, [key]: value } }));
    if (fieldErrors.consumption) setFieldErrors(prev => ({ ...prev, consumption: '' }));
  };

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Location cascade ──
  const onStateSelect = (e) => {
    const id = e.target.value;
    const name = states.find(s => s._id === id)?.name;
    setSelection({ stateId: id, stateName: name, districtId: '', districtName: '', mandalId: '', mandalName: '', villageId: '', villageName: '' });
    setDistricts([]); setMandals([]); setVillages([]);
    if (fieldErrors.village) setFieldErrors(prev => ({ ...prev, village: '' }));
    if (!id) return;
    setLoading(p => ({ ...p, dist: true }));
    axios.get(`/districts/state/${id}`)
      .then(res => setDistricts(res.data.data || res.data))
      .finally(() => setLoading(p => ({ ...p, dist: false })));
  };

  const onDistrictSelect = (e) => {
    const id = e.target.value;
    const name = districts.find(d => d._id === id)?.name;
    setSelection(prev => ({ ...prev, districtId: id, districtName: name, mandalId: '', mandalName: '', villageId: '', villageName: '' }));
    setMandals([]); setVillages([]);
    if (!id) return;
    setLoading(p => ({ ...p, mandal: true }));
    axios.get(`/mandals/${id}`)
      .then(res => setMandals(res.data.data || res.data))
      .finally(() => setLoading(p => ({ ...p, mandal: false })));
  };

  const onMandalSelect = (e) => {
    const id = e.target.value;
    const name = mandals.find(m => m._id === id)?.name;
    setSelection(prev => ({ ...prev, mandalId: id, mandalName: name, villageId: '', villageName: '' }));
    setVillages([]);
    if (!id) return;
    setLoading(p => ({ ...p, village: true }));
    axios.get(`/Villages/${id}`)
      .then(res => setVillages(res.data.data || res.data))
      .finally(() => setLoading(p => ({ ...p, village: false })));
  };

  const onVillageSelect = (e) => {
    const raw = e.target.value;
    const found = villages.find(v => (v._id || v) === raw);
    setSelection(prev => ({ ...prev, villageId: found?._id || '', villageName: found?.name || raw }));
    if (fieldErrors.village) setFieldErrors(prev => ({ ...prev, village: '' }));
  };

  // ── Validation ──
  const validate = () => {
    const errs = {};
    if (!isAdminMode && !selection.villageName) errs.village = t.errVillage;
    if (!form.familyHead?.trim())  errs.familyHead  = t.errFamilyHead;
    if (!form.wardArea?.trim())    errs.wardArea     = t.errWardArea;
    if (!form.doorNumber?.trim())  errs.doorNumber   = t.errDoorNumber;

    const validMobiles = mobileNumbers.filter(m => m.length > 0);
    if (validMobiles.length === 0) {
      errs.mobile = t.errMobileMin;
    } else {
      validMobiles.forEach((m, i) => {
        if (!/^[6-9]\d{9}$/.test(m)) errs[`mobile_${i}`] = t.errMobileInvalid;
      });
    }

    if (!form.familyMembers) errs.familyMembers = t.errFamilyMembers;
    if (!form.familyType)    errs.familyType    = t.errFamilyType;
    if (!form.occupation)    errs.occupation    = t.errOccupation;

    const hasConsumption = Object.values(form.consumption).some(v => v && v.toString().trim().length > 0);
    if (!hasConsumption) errs.consumption = t.errConsumption;

    if (!form.grocerySource)     errs.grocerySource     = t.errGrocerySource;
    if (!form.monthlySpending)   errs.monthlySpending   = t.errMonthlySpending;
    if (form.monthlySpending === 'custom' && !form.monthlySpendingCustom)
      errs.monthlySpendingCustom = t.errMonthlySpendingCustom;
    if (!form.purchaseFrequency) errs.purchaseFrequency = t.errPurchaseFreq;
    if (!form.brandedPreference) errs.brandedPreference = t.errBrandedPref;
    if (!form.productType)       errs.productType       = t.errProductType;
    if (!form.cheaperOption)     errs.cheaperOption     = t.errDigitalSuper;

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Submit (create new) ──
  const handleCreate = async (e) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) {
      const firstErr = document.querySelector('[data-error="true"]');
      if (firstErr) firstErr.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setIsSubmitting(true);
    const parsedConsumption = {};
    consumptionItems.forEach(item => {
      const parsed = parseConsumptionInput(form.consumption[item.key]);
      if (parsed) parsedConsumption[item.key] = parsed;
    });
    const payload = {
      wardArea: form.wardArea, doorNumber: form.doorNumber, familyHead: form.familyHead,
      familyMembers: form.familyMembers, familyType: form.familyType, occupation: form.occupation,
      grocerySource: form.grocerySource,
      monthlySpending: form.monthlySpending === 'custom' ? form.monthlySpendingCustom : form.monthlySpending,
      purchaseFrequency: form.purchaseFrequency, brandedPreference: form.brandedPreference,
      productType: form.productType, cheaperOption: form.cheaperOption, orderMethod: form.orderMethod,
      consumption: parsedConsumption,
      mobile: mobileNumbers.filter(m => m.length === 10),
      surveyorId: agentData?.surveyorId || agentData?.SurveyorId || '',
      villageId: selection.villageId,
      surveyDate: new Date().toISOString().split('T')[0],
      stateName: selection.stateName, districtName: selection.districtName,
      MandalName: selection.mandalName, VillageName: selection.villageName,
    };
    try {
      await axios.post('/surveys/form', payload);
      setIsSubmitted(true);
    } catch (err) {
      setServerError(t.errServer + (err.response?.data?.error || 'Server error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Submit (update existing) ──
  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const parsedConsumption = {};
    consumptionItems.forEach(item => {
      const raw = form.consumption[item.key];
      if (raw !== null && raw !== undefined && raw !== '') {
        const p = parseConsumptionInput(String(raw));
        if (p) parsedConsumption[item.key] = p;
      }
    });
    try {
      await axios.put(`/api/surveys/${initialData._id}`, {
        ...form,
        consumption: parsedConsumption,
        mobile: mobileNumbers.filter(m => m.length === 10),
      });
      showToast('success', t.updateSuccess);
      setTimeout(() => onFinished?.(), 1200);
    } catch {
      showToast('error', t.updateError);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setIsSubmitted(false);
    setForm({ wardArea: '', doorNumber: '', familyHead: '', familyMembers: '', familyType: '',
      occupation: '', grocerySource: '', monthlySpending: '', monthlySpendingCustom: '',
      purchaseFrequency: '', brandedPreference: '', productType: '', cheaperOption: '',
      orderMethod: '', consumption: {}, otherProduct: '', surveyorNote: '' });
    setMobileNumbers(['']);
    setSelection({ stateName: '', districtName: '', mandalName: '', villageName: '',
      stateId: '', districtId: '', mandalId: '', villageId: '' });
    setFieldErrors({}); setServerError('');
  };

  // Extra DB keys not in named sections
  const extraKeys = initialData
    ? Object.keys(initialData).filter(k => !HANDLED_KEYS.has(k))
    : [];

  // ── Success screen (create mode only) ──
  if (!isAdminMode && isSubmitted) {
    return <SuccessCard t={t} onReset={resetForm} />;
  }

  const mobileArr = Array.isArray(form.mobile) ? form.mobile
    : mobileNumbers;

  // ── RENDER ──────────────────────────────────────────────────────────────────
  return (
    <div className={isAdminMode ? styles.wrapper : styles.page}>

      {/* Toast (admin only) */}
      {isAdminMode && toast && (
        <div className={`${styles.toast} ${styles[`toast_${toast.type}`]}`}>{toast.msg}</div>
      )}

      {/* ── TOP BAR (create mode) / HEADER (admin mode) ── */}
      {isAdminMode ? (
        <div className={styles.formHeader}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}><ClipboardCheck size={20} /></div>
            <div>
              <h2 className={styles.formTitle}>
                {isViewOnly ? t.viewTitle : t.editTitle}
              </h2>
              {form.surveyId && (
                <span className={styles.surveyIdBadge}>
                  <Hash size={10} /> {form.surveyId}
                </span>
              )}
            </div>
          </div>
          <div className={styles.headerRight}>
            <div className={styles.langPill}>
              <button type="button" className={`${styles.langBtn} ${lang === 'en' ? styles.langBtnActive : ''}`} onClick={() => setLang('en')}>EN</button>
              <button type="button" className={`${styles.langBtn} ${lang === 'te' ? styles.langBtnActive : ''}`} onClick={() => setLang('te')}>తె</button>
            </div>
            {isViewOnly
              ? <button type="button" className={styles.editToggleBtn} onClick={() => setCurrentMode('edit')}><Edit3 size={13} /> {t.editBtn}</button>
              : <button type="button" className={styles.viewToggleBtn} onClick={() => setCurrentMode('view')}><Eye size={13} /> {t.cancelBtn}</button>
            }
            {onClose && <button type="button" className={styles.closeBtn} onClick={onClose}><X size={17} /></button>}
          </div>
        </div>
      ) : (
        <div className={styles.topbar}>
          <ClipboardCheck size={22} color="#2563eb" />
          <h1 className={styles.topbarTitle}>{t.pageTitle}</h1>
          <div className={styles.langToggle}>
            <button type="button" className={`${styles.langBtn} ${lang === 'en' ? styles.langBtnActive : ''}`} onClick={() => setLang('en')}>EN</button>
            <button type="button" className={`${styles.langBtn} ${lang === 'te' ? styles.langBtnActive : ''}`} onClick={() => setLang('te')}>తె</button>
          </div>
          {(agentData?.surveyorId || agentData?.SurveyorId) && (
            <span className={styles.agentBadge}>ID: {agentData?.surveyorId || agentData?.SurveyorId}</span>
          )}
        </div>
      )}

      {/* ── FORM ── */}
      <form
        onSubmit={isAdminMode ? handleUpdate : handleCreate}
        className={isAdminMode ? styles.formBody : styles.form}
        noValidate
      >

        {/* ══ LOCATION ══ */}
        <SectionCard
          color="#2563eb" icon="📍" title={t.secLocation}
          isAdmin={isAdminMode}
        >
          {isAdminMode ? (
            /* Admin: show read-only location tiles + editable wardArea */
            <>
              <div className={styles.grid4}>
                <ReadTile label={t.state}     value={form.stateName}    locked />
                <ReadTile label={t.district}  value={form.districtName} locked />
                <ReadTile label={t.mandal}    value={form.MandalName}   locked />
                <ReadTile label={t.village}   value={form.VillageName}  locked />
              </div>
              <div className={styles.grid4} style={{ marginTop: 12 }}>
                <ReadTile label={t.villageId}  value={form.villageId}  locked mono />
                <EditTile label={t.wardArea}   name="wardArea"  value={form.wardArea}  isView={isViewOnly} onChange={handleChange} />
                <ReadTile label={t.surveyDate} value={form.surveyDate} locked />
                <ReadTile label={t.surveyorId} value={form.surveyorId} locked mono />
              </div>
            </>
          ) : (
            /* Create: location dropdowns */
            <>
              <div className={styles.grid4}>
                <div className={styles.field}>
                  <label className={styles.label}>{t.state} {loading.state && <span className={styles.loading}>{t.loadingText}</span>}</label>
                  <select className={styles.select} value={selection.stateId} onChange={onStateSelect}>
                    <option value="">{t.selectState}</option>
                    {states.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                  </select>
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>{t.district} {loading.dist && <span className={styles.loading}>{t.loadingText}</span>}</label>
                  <select className={styles.select} value={selection.districtId} onChange={onDistrictSelect} disabled={!districts.length}>
                    <option value="">{t.selectDistrict}</option>
                    {districts.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                  </select>
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>{t.mandal} {loading.mandal && <span className={styles.loading}>{t.loadingText}</span>}</label>
                  <select className={styles.select} value={selection.mandalId} onChange={onMandalSelect} disabled={!mandals.length}>
                    <option value="">{t.selectMandal}</option>
                    {mandals.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
                  </select>
                </div>
                <div className={styles.field} data-error={!!fieldErrors.village}>
                  <label className={styles.label}>{t.village} {loading.village && <span className={styles.loading}>{t.loadingText}</span>}</label>
                  <select className={`${styles.select} ${fieldErrors.village ? styles.inputError : ''}`} value={selection.villageId || selection.villageName} onChange={onVillageSelect} disabled={!villages.length}>
                    <option value="">{t.selectVillage}</option>
                    {villages.map((v, i) => <option key={`${v._id||v}-${i}`} value={v._id||v}>{v.name||v}</option>)}
                  </select>
                  {fieldErrors.village && <span className={styles.errorText}>{fieldErrors.village}</span>}
                </div>
              </div>
              <div className={styles.field} style={{ marginTop: 14 }} data-error={!!fieldErrors.wardArea}>
                <label className={styles.label}>{t.wardArea}</label>
                <input className={`${styles.input} ${fieldErrors.wardArea ? styles.inputError : ''}`} placeholder={t.wardPlaceholder} name="wardArea" value={form.wardArea} onChange={handleChange} />
                {fieldErrors.wardArea && <span className={styles.errorText}>{fieldErrors.wardArea}</span>}
              </div>
            </>
          )}
        </SectionCard>

        {/* ══ IDENTITY & CONTACT ══ */}
        <SectionCard color="#7c3aed" icon="🪪" title={t.secIdentity} isAdmin={isAdminMode}>
          <div className={styles.grid2}>
            {isAdminMode ? (
              <>
                <EditTile label={t.familyHead} name="familyHead" value={form.familyHead} isView={isViewOnly} onChange={handleChange} />
                <EditTile label={t.doorNumber} name="doorNumber" value={form.doorNumber} isView={isViewOnly} onChange={handleChange} />
              </>
            ) : (
              <>
                <div className={styles.field} data-error={!!fieldErrors.doorNumber}>
                  <label className={styles.label}>{t.doorNumber}</label>
                  <input className={`${styles.input} ${fieldErrors.doorNumber ? styles.inputError : ''}`} placeholder={t.doorPlaceholder} name="doorNumber" value={form.doorNumber} onChange={handleChange} />
                  {fieldErrors.doorNumber && <span className={styles.errorText}>{fieldErrors.doorNumber}</span>}
                </div>
                <div className={styles.field} data-error={!!fieldErrors.familyHead}>
                  <label className={styles.label}>{t.familyHead}</label>
                  <input className={`${styles.input} ${fieldErrors.familyHead ? styles.inputError : ''}`} placeholder={t.familyHeadPlaceholder} name="familyHead" value={form.familyHead} onChange={handleChange} />
                  {fieldErrors.familyHead && <span className={styles.errorText}>{fieldErrors.familyHead}</span>}
                </div>
              </>
            )}
          </div>

          {/* Mobile numbers */}
          <div className={styles.field} style={{ marginTop: 14 }} data-error={!!fieldErrors.mobile}>
            <label className={styles.label}>{t.mobileNumbers}</label>
            {fieldErrors.mobile && <span className={styles.errorText}>{fieldErrors.mobile}</span>}

            {isAdminMode && isViewOnly ? (
              /* View mode: show as pill tags */
              <div className={styles.mobilePillRow}>
                {mobileArr.length === 0
                  ? <span className={styles.emptyVal}>—</span>
                  : mobileArr.map((num, i) => <span key={i} className={styles.mobileTag}>{num || <span className={styles.nullVal}>null</span>}</span>)
                }
              </div>
            ) : (
              /* Create / edit mode: editable rows */
              mobileNumbers.map((val, i) => (
                <div key={i} className={styles.mobileRow}>
                  <input
                    className={`${styles.input} ${fieldErrors[`mobile_${i}`] ? styles.inputError : ''}`}
                    placeholder={`${t.mobilePlaceholder} ${i + 1}`}
                    value={val} maxLength={10}
                    onChange={e => {
                      const newM = [...mobileNumbers];
                      newM[i] = e.target.value.replace(/\D/g, '');
                      setMobileNumbers(newM);
                      if (fieldErrors[`mobile_${i}`]) setFieldErrors(prev => ({ ...prev, [`mobile_${i}`]: '' }));
                    }}
                  />
                  {i === 0
                    ? <button type="button" className={styles.mobileAdd} onClick={() => setMobileNumbers([...mobileNumbers, ''])}>{t.addMobile}</button>
                    : <button type="button" className={styles.mobileRemove} onClick={() => setMobileNumbers(mobileNumbers.filter((_, idx) => idx !== i))}>{t.removeMobile}</button>
                  }
                  {fieldErrors[`mobile_${i}`] && <span className={styles.errorText} style={{ width: '100%' }}>{fieldErrors[`mobile_${i}`]}</span>}
                </div>
              ))
            )}
          </div>
        </SectionCard>

        {/* ══ HOUSEHOLD ══ */}
        <SectionCard color="#059669" icon="🏠" title={t.secHousehold} isAdmin={isAdminMode}>
          <div className={styles.grid3}>
            {isAdminMode ? (
              <>
                <EditTile label={t.familyMembers} name="familyMembers" type="number" value={form.familyMembers} isView={isViewOnly} onChange={handleChange} />
                <EditTile label={t.familyType}    name="familyType"    value={form.familyType}    isView={isViewOnly} onChange={handleChange} />
                <EditTile label={t.occupation}    name="occupation"    value={form.occupation}    isView={isViewOnly} onChange={handleChange} />
              </>
            ) : (
              <>
                <div className={styles.field} data-error={!!fieldErrors.familyMembers}>
                  <label className={styles.label}>{t.familyMembers}</label>
                  <input className={`${styles.input} ${fieldErrors.familyMembers ? styles.inputError : ''}`} type="number" placeholder={t.familyMembersPlaceholder} name="familyMembers" value={form.familyMembers} onChange={handleChange} min={1} />
                  {fieldErrors.familyMembers && <span className={styles.errorText}>{fieldErrors.familyMembers}</span>}
                </div>
                <div className={styles.field} data-error={!!fieldErrors.familyType}>
                  <label className={styles.label}>{t.familyType}</label>
                  <select className={`${styles.select} ${fieldErrors.familyType ? styles.inputError : ''}`} name="familyType" value={form.familyType} onChange={handleChange}>
                    <option value="">{t.selectType}</option>
                    <option value="Nuclear Family">{t.nuclear}</option>
                    <option value="Joint Family">{t.joint}</option>
                  </select>
                  {fieldErrors.familyType && <span className={styles.errorText}>{fieldErrors.familyType}</span>}
                </div>
                <div className={styles.field} data-error={!!fieldErrors.occupation}>
                  <label className={styles.label}>{t.occupation}</label>
                  <select className={`${styles.select} ${fieldErrors.occupation ? styles.inputError : ''}`} name="occupation" value={form.occupation} onChange={handleChange}>
                    <option value="">{t.selectOccupation}</option>
                    <option value="Farming">{t.farming}</option>
                    <option value="Daily wage worker">{t.dailyWage}</option>
                    <option value="Private job">{t.privateJob}</option>
                    <option value="Government job">{t.govtJob}</option>
                    <option value="Business">{t.business}</option>
                    <option value="Other">{t.other}</option>
                  </select>
                  {fieldErrors.occupation && <span className={styles.errorText}>{fieldErrors.occupation}</span>}
                </div>
              </>
            )}
          </div>
        </SectionCard>

        {/* ══ MONTHLY CONSUMPTION ══ */}
        <SectionCard color="#d97706" icon="🛒" title={t.secConsumption} isAdmin={isAdminMode}>
          {!isAdminMode && <p className={styles.hint}>{t.consumptionHint}</p>}
          {fieldErrors.consumption && (
            <div className={styles.errorBanner} data-error="true">⚠️ {fieldErrors.consumption}</div>
          )}
          <div className={styles.consumptionGrid}>
            {consumptionItems.map(item => {
              const raw = form.consumption[item.key] ?? '';
              const dbObj = initialData?.consumption?.[item.key];
              return (
                <div key={item.key} className={styles.consumptionItem}>
                  <label className={styles.consumptionLabel}>
                    <span style={{ marginRight: 5 }}>{item.icon}</span>
                    {item.label[lang]}
                  </label>

                  {isAdminMode && isViewOnly ? (
                    /* Admin view: show parsed value+unit */
                    <div className={styles.consViewValue}>
                      {raw === '' || raw === null
                        ? <span className={styles.emptyVal}>—</span>
                        : <>
                            <span className={styles.consNum}>{dbObj?.value ?? raw}</span>
                            {dbObj?.unit && <span className={styles.consUnit}> {dbObj.unit}</span>}
                          </>
                      }
                    </div>
                  ) : (
                    <input
                      className={styles.consumptionInput}
                      placeholder={item.ph[lang]}
                      value={raw}
                      onChange={e => handleConsumptionChange(item.key, e.target.value)}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </SectionCard>

        {/* ══ SHOPPING PREFERENCES ══ */}
        <SectionCard color="#db2777" icon="📊" title={t.secPreferences} isAdmin={isAdminMode}>
          <div className={styles.grid2}>
            {isAdminMode ? (
              <>
                <EditTile label={t.grocerySource}    name="grocerySource"    value={form.grocerySource}    isView={isViewOnly} onChange={handleChange} />
                <EditTile label={t.monthlySpend}     name="monthlySpending"  value={form.monthlySpending}  isView={isViewOnly} onChange={handleChange} />
                <EditTile label={t.purchaseFreq}     name="purchaseFrequency" value={form.purchaseFrequency} isView={isViewOnly} onChange={handleChange} />
                <EditTile label={t.brandedPref}      name="brandedPreference" value={form.brandedPreference} isView={isViewOnly} onChange={handleChange} />
                <EditTile label={t.productType}      name="productType"      value={form.productType}      isView={isViewOnly} onChange={handleChange} />
                <EditTile label={t.digitalSuper}     name="cheaperOption"    value={form.cheaperOption}    isView={isViewOnly} onChange={handleChange} />
                <EditTile label={t.orderMethod}      name="orderMethod"      value={form.orderMethod}      isView={isViewOnly} onChange={handleChange} />
              </>
            ) : (
              <>
                <div className={styles.field} data-error={!!fieldErrors.grocerySource}>
                  <label className={styles.label}>{t.grocerySource}</label>
                  <select className={`${styles.select} ${fieldErrors.grocerySource ? styles.inputError : ''}`} name="grocerySource" value={form.grocerySource} onChange={handleChange}>
                    <option value="">{t.selectSource}</option>
                    <option value="Local Kirana shop">{t.localKirana}</option>
                    <option value="Weekly market">{t.weeklyMarket}</option>
                    <option value="Town supermarket">{t.townSuper}</option>
                    <option value="Online">{t.online}</option>
                  </select>
                  {fieldErrors.grocerySource && <span className={styles.errorText}>{fieldErrors.grocerySource}</span>}
                </div>
                <div className={styles.field} data-error={!!fieldErrors.monthlySpending}>
                  <label className={styles.label}>{t.monthlySpend}</label>
                  <select className={`${styles.select} ${fieldErrors.monthlySpending ? styles.inputError : ''}`} name="monthlySpending" value={form.monthlySpending} onChange={handleChange}>
                    <option value="">{t.selectRange}</option>
                    <option value="2000-3000">{t.spend1}</option>
                    <option value="3000-5000">{t.spend2}</option>
                    <option value="custom">{t.spend3}</option>
                  </select>
                  {fieldErrors.monthlySpending && <span className={styles.errorText}>{fieldErrors.monthlySpending}</span>}
                  {form.monthlySpending === 'custom' && (
                    <>
                      <input className={`${styles.input} ${fieldErrors.monthlySpendingCustom ? styles.inputError : ''}`} style={{ marginTop: 8 }} type="number" placeholder={t.exactAmount} name="monthlySpendingCustom" value={form.monthlySpendingCustom} onChange={handleChange} min={5001} />
                      {fieldErrors.monthlySpendingCustom && <span className={styles.errorText}>{fieldErrors.monthlySpendingCustom}</span>}
                    </>
                  )}
                </div>
                <div className={styles.field} data-error={!!fieldErrors.purchaseFrequency}>
                  <label className={styles.label}>{t.purchaseFreq}</label>
                  <select className={`${styles.select} ${fieldErrors.purchaseFrequency ? styles.inputError : ''}`} name="purchaseFrequency" value={form.purchaseFrequency} onChange={handleChange}>
                    <option value="">{t.selectFreq}</option>
                    <option value="Daily">{t.daily}</option>
                    <option value="Weekly">{t.weekly}</option>
                    <option value="Once a month">{t.monthly}</option>
                  </select>
                  {fieldErrors.purchaseFrequency && <span className={styles.errorText}>{fieldErrors.purchaseFrequency}</span>}
                </div>
                <div className={styles.field} data-error={!!fieldErrors.brandedPreference}>
                  <label className={styles.label}>{t.brandedPref}</label>
                  <select className={`${styles.select} ${fieldErrors.brandedPreference ? styles.inputError : ''}`} name="brandedPreference" value={form.brandedPreference} onChange={handleChange}>
                    <option value="">{t.selectPref}</option>
                    <option value="Yes">{t.yes}</option>
                    <option value="No">{t.no}</option>
                    <option value="Sometimes">{t.sometimes}</option>
                  </select>
                  {fieldErrors.brandedPreference && <span className={styles.errorText}>{fieldErrors.brandedPreference}</span>}
                </div>
                <div className={styles.field} data-error={!!fieldErrors.productType}>
                  <label className={styles.label}>{t.productType}</label>
                  <select className={`${styles.select} ${fieldErrors.productType ? styles.inputError : ''}`} name="productType" value={form.productType} onChange={handleChange}>
                    <option value="">{t.selectPType}</option>
                    <option value="Loose products">{t.loose}</option>
                    <option value="Packaged products">{t.packaged}</option>
                  </select>
                  {fieldErrors.productType && <span className={styles.errorText}>{fieldErrors.productType}</span>}
                </div>
                <div className={styles.field} data-error={!!fieldErrors.cheaperOption}>
                  <label className={styles.label}>{t.digitalSuper}</label>
                  <select className={`${styles.select} ${fieldErrors.cheaperOption ? styles.inputError : ''}`} name="cheaperOption" value={form.cheaperOption} onChange={handleChange}>
                    <option value="">{t.selectOption}</option>
                    <option value="Yes">{t.yes}</option>
                    <option value="No">{t.no}</option>
                  </select>
                  {fieldErrors.cheaperOption && <span className={styles.errorText}>{fieldErrors.cheaperOption}</span>}
                </div>
              </>
            )}
          </div>
        </SectionCard>

        {/* ══ EXTRA FIELDS (admin only, unknown DB keys) ══ */}
        {isAdminMode && extraKeys.length > 0 && (
          <SectionCard color="#64748b" icon="📋" title={t.secExtra} isAdmin>
            <div className={styles.grid3}>
              {extraKeys.map(k => (
                <div key={k} className={styles.field}>
                  <label className={styles.label}>{k}</label>
                  <div className={`${styles.readValue} ${styles.readValueLocked}`}>
                    {initialData[k] === null ? <span className={styles.nullVal}>null</span>
                      : initialData[k] === undefined || initialData[k] === ''
                        ? <span className={styles.emptyVal}>—</span>
                        : typeof initialData[k] === 'object'
                          ? <span className={styles.monoText}>{JSON.stringify(initialData[k])}</span>
                          : String(initialData[k])
                    }
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        )}

        {/* ══ RECORD META (admin only) ══ */}
        {isAdminMode && (
          <SectionCard color="#94a3b8" icon="ℹ️" title={t.secMeta} isAdmin>
            <div className={styles.grid3}>
              <div className={styles.field}>
                <label className={styles.label}>{t.dbId}</label>
                <div className={`${styles.readValue} ${styles.readValueLocked} ${styles.monoText}`}>{form._id || '—'}</div>
              </div>
              <div className={styles.field}>
                <label className={styles.label}>{t.createdAt}</label>
                <div className={`${styles.readValue} ${styles.readValueLocked}`}>{fmtDate(form.createdAt) || '—'}</div>
              </div>
              <div className={styles.field}>
                <label className={styles.label}>{t.updatedAt}</label>
                <div className={`${styles.readValue} ${styles.readValueLocked}`}>{fmtDate(form.updatedAt) || '—'}</div>
              </div>
            </div>
          </SectionCard>
        )}

        {/* ── Server error (create mode) ── */}
        {!isAdminMode && serverError && (
          <div className={styles.errorBanner}>⚠️ {serverError}</div>
        )}

        {/* ── Submit / Save button ── */}
        {isAdminMode ? (
          !isViewOnly && (
            <div className={styles.saveFooter}>
              <button type="button" className={styles.cancelBtn} onClick={() => setCurrentMode('view')}>
                <Eye size={14} /> {t.cancelBtn}
              </button>
              <button type="submit" className={styles.saveBtn} disabled={isSubmitting}>
                {isSubmitting
                  ? <><Loader2 size={14} className={styles.spin} /> {t.saving}</>
                  : <><Save size={14} /> {t.saveBtn}</>
                }
              </button>
            </div>
          )
        ) : (
          <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
            {isSubmitting
              ? <><span className={styles.spinner} /> {t.submitting}</>
              : t.submitBtn
            }
          </button>
        )}

      </form>
    </div>
  );
}

// ─── REUSABLE SUB-COMPONENTS ──────────────────────────────────────────────────

/** Section wrapper — handles both admin (borderless clean card) and create (colored header card) */
function SectionCard({ color, icon, title, children, isAdmin }) {
  if (isAdmin) {
    return (
      <div className={styles.section}>
        <div className={styles.sectionHead}>
          <span className={styles.sectionIconWrap} style={{ background: color + '1a', color }}>{icon}</span>
          <span className={styles.sectionTitle}>{title}</span>
        </div>
        <div className={styles.sectionBody}>{children}</div>
      </div>
    );
  }
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader} style={{ borderColor: color }}>
        <span className={styles.cardIcon}>{icon}</span>
        <h2 className={styles.cardTitle}>{title}</h2>
      </div>
      {children}
    </div>
  );
}

/** Read-only display tile (admin) */
function ReadTile({ label, value, locked, mono }) {
  const cls = [styles.readValue, locked ? styles.readValueLocked : '', mono ? styles.monoText : ''].filter(Boolean).join(' ');
  return (
    <div className={styles.field}>
      <label className={styles.label}>{label}</label>
      <div className={cls}>
        {value === null      ? <span className={styles.nullVal}>null</span>
         : !value            ? <span className={styles.emptyVal}>—</span>
         : String(value)
        }
      </div>
    </div>
  );
}

/** Toggle between read tile and input (admin edit) */
function EditTile({ label, name, value, isView, onChange, type = 'text' }) {
  return (
    <div className={styles.field}>
      <label className={styles.label}>{label}</label>
      {isView ? (
        <div className={styles.readValue}>
          {value === null      ? <span className={styles.nullVal}>null</span>
           : value === undefined || value === '' ? <span className={styles.emptyVal}>—</span>
           : String(value)
          }
        </div>
      ) : (
        <input className={styles.input} type={type} name={name} value={value ?? ''} onChange={onChange} />
      )}
    </div>
  );
}

function SuccessCard({ t, onReset }) {
  return (
    <div className={styles.successPage}>
      <div className={styles.successCard}>
        <div className={styles.successIcon}><CheckCircle size={64} color="#16a34a" /></div>
        <h2 className={styles.successTitle}>{t.successTitle}</h2>
        <p className={styles.successSub}>{t.successSub}</p>
        <button className={styles.newSurveyBtn} onClick={onReset}>{t.newSurvey}</button>
      </div>
    </div>
  );
}