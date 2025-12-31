import React, { useState, useEffect } from 'react';
import { useStore } from './store';
import { GoogleGenerativeAI } from "@google/generative-ai";

const MODELS = [
    "gemini-3-flash-preview", "gemini-3-pro-preview",
    "gemini-2.5-flash", "gemini-2.5-pro", "gemini-2.5-flash-lite",
    "gemini-2.5-flash-preview-09-2025", "gemini-2.5-flash-lite-preview-09-2025",
    "gemini-2.0-flash", "gemini-2.0-flash-exp", "gemini-2.0-flash-001",
    "gemini-2.0-flash-lite", "gemini-2.0-flash-lite-001", "gemini-2.0-flash-lite-preview", "gemini-2.0-flash-lite-preview-02-05"
];

const PROMPT_TEMPLATE = (planetName) => `Generate a JSON object for the celestial body "${planetName}".
The JSON must strictly follow this schema (no markdown formatting, just raw JSON):
{
    "latest_news": [
        { "headline": "Headline 1", "date": "Date", "body": "Short paragraph." },
        { "headline": "Headline 2", "date": "Date", "body": "Short paragraph." },
        { "headline": "Headline 3", "date": "Date", "body": "Short paragraph." },
        { "headline": "Headline 4", "date": "Date", "body": "Short paragraph." },
        { "headline": "Headline 5", "date": "Date", "body": "Short paragraph." }
    ],
    "deep_dive": "A detailed 300-word scientific article about the geology, potential for life, and future exploration of this body.",
    "history_timeline": [
        { "date": "Year", "event": "Event description" },
        { "date": "Year", "event": "Event description" },
        { "date": "Year", "event": "Event description" },
        { "date": "Year", "event": "Event description" },
        { "date": "Year", "event": "Event description" }
    ],
    "pop_culture": [
        "Mention in Movie/Book 1",
        "Mention in Movie/Book 2",
        "Mention in Movie/Book 3"
    ],
    "deepStats": [
        { "label": "Mean Density", "value": "5.51 g/cm³" },
        { "label": "Atmosphere", "value": "N2, O2, Ar" },
        ... (Total 5 scientifically accurate stats like Surface Gravity, Escape Velocity, Core Temp, etc)
    ]
}
Keep descriptions concise and scientific.`;

const glassStyle = {
    background: 'rgba(10, 10, 14, 0.7)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.5)'
};

const sessionCache = {};
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export default function Dashboard() {
    const { activePlanet, activePlanetData, clearSelection } = useStore();

    // UI Visibility States
    const [visible, setVisible] = useState(false);
    const [showLeft, setShowLeft] = useState(true);
    const [showRight, setShowRight] = useState(true);
    const [showBottom, setShowBottom] = useState(true);
    const [isFeedExpanded, setIsFeedExpanded] = useState(false);
    const [showModelList, setShowModelList] = useState(false);

    // Data States
    const [currentModel, setCurrentModel] = useState("gemini-3-flash-preview");
    const [aiData, setAiData] = useState(null);
    const [loadingAi, setLoadingAi] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);
    const [wikiData, setWikiData] = useState(null);
    const [images, setImages] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);

    // Initial Planet Load & Reset
    useEffect(() => {
        if (activePlanetData) {
            setVisible(true);
            setIsFeedExpanded(false);
            setAiData(null);
            setErrorMsg(null);
            setWikiData(null);
            setImages([]);

            setSelectedImage(null);

            fetchInternalData();
        } else {
            setVisible(false);
        }
    }, [activePlanetData]);


    const fetchInternalData = async (modelOverride = null) => {
        const modelToUse = modelOverride || currentModel;

        const cacheKey = `ai_data_${activePlanetData.name}_${modelToUse}`;
        const cached = sessionCache[cacheKey];

        if (cached) {
            setAiData(cached);
            setErrorMsg(null);
        } else {
            setLoadingAi(true);
            setErrorMsg(null);
            setAiData(null);
            try {
                const genAI = new GoogleGenerativeAI(API_KEY);
                const model = genAI.getGenerativeModel({ model: modelToUse });

                const result = await model.generateContent(PROMPT_TEMPLATE(activePlanetData.name));
                const response = await result.response;
                const text = response.text();
                const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
                const data = JSON.parse(jsonStr);

                if (data) {
                    setAiData(data);
                    sessionCache[cacheKey] = data;
                }
            } catch (err) {
                console.error("AI Fetch Error", err);
                if (err.message && err.message.includes("429")) {
                    setErrorMsg(`CRITICAL: API Quota Exceeded for ${modelToUse}. Model Unavailable.`);
                } else {
                    setErrorMsg("Connection Failed.");
                }
            }
            setLoadingAi(false);
        }

        if (!wikiData) {
            try {
                const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${activePlanetData.name}`);
                const data = await res.json();
                if (data.extract) {
                    setWikiData({
                        intro: data.extract,
                        image: data.originalimage ? data.originalimage.source : null
                    });
                }
            } catch (e) {
                console.error("Wiki fetch error", e);
            }
        }

        if (images.length === 0) {
            try {
                const response = await fetch(`https://images-api.nasa.gov/search?q=${activePlanetData.name}&media_type=image`);
                const data = await response.json();
                if (data.collection?.items) {
                    const items = data.collection.items
                        .filter(item => item.links?.[0]?.href)
                        .slice(0, 50)
                        .map(item => ({
                            id: item.data[0].nasa_id,
                            title: item.data[0].title,
                            desc: item.data[0].description,
                            thumb: item.links[0].href,
                        }));
                    setImages(items);
                }
            } catch (err) { console.error(err); }
        }
    };


    const handleWheel = (e) => {
        // Logic Fix 2: Inverted Scroll Trigger
        // Expand on Wheel Down (deltaY > 0)
        if (e.deltaY > 5 && !isFeedExpanded) {
            setIsFeedExpanded(true);
        }
        // Collapse on Wheel Up (deltaY < 0) when at top
        else if (e.deltaY < -5 && isFeedExpanded && e.currentTarget.scrollTop === 0) {
            setIsFeedExpanded(false);
        }
    };

    if (!activePlanetData) return null;

    return (
        <div style={styles.container}>
            {/* PANEL 1: LEFT (Telemetry) */}
            <div
                style={{
                    ...styles.panel,
                    ...styles.leftPanel,
                    transform: visible && showLeft ? 'translateX(0)' : 'translateX(-100%)',
                    pointerEvents: visible && showLeft ? 'auto' : 'none'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    style={styles.sideToggleRight}
                    onClick={(e) => { e.stopPropagation(); setShowLeft(!showLeft); }}
                >
                    {showLeft ? '«' : '»'}
                </button>

                <div style={styles.header}>
                    <h1 style={styles.title}>{activePlanetData.name.toUpperCase()}</h1>
                </div>

                <div style={styles.section}>
                    <div style={styles.sectionTitle}>TELEMETRY</div>
                    <div style={styles.dataGrid}>
                        <DataRow label="Type" value={activePlanetData.type || 'Planet'} />
                        <DataRow label="Radius" value={activePlanetData.size} />
                        {aiData?.deepStats ? (
                            aiData.deepStats.map((s, i) => <DataRow key={i} label={s.label} value={s.value} />)
                        ) : <DataRow label="Status" value="Scanning..." />}
                    </div>
                </div>

                <button style={styles.closeButton} onClick={(e) => { e.stopPropagation(); clearSelection(); }}>
                    TERMINATE
                </button>
            </div>

            {/* PANEL 2: BOTTOM (Feed) */}
            <div
                style={{
                    ...styles.panel,
                    ...styles.bottomPanel,
                    // Visual Fix 3: GPU Animation using transform
                    height: '100%',
                    top: 0,
                    // If expanded, move to 0. If collapsed, move down but keep 200px visible.
                    transform: visible && showBottom
                        ? (isFeedExpanded ? 'translateY(0)' : 'translateY(calc(100% - 200px))')
                        : 'translateY(100%)',
                    pointerEvents: visible && showBottom ? 'auto' : 'none',
                    background: isFeedExpanded ? 'rgba(5, 5, 8, 0.98)' : glassStyle.background,
                    transition: 'transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)', // Smooth physics
                }}
                onClick={(e) => e.stopPropagation()}
                onWheel={handleWheel}
            >
                <button
                    style={styles.bottomToggle}
                    onClick={(e) => { e.stopPropagation(); setIsFeedExpanded(!isFeedExpanded); }}
                >
                    {isFeedExpanded ? 'v' : '^'}
                </button>

                {/* MODEL SWITCHER */}
                <div
                    style={styles.modelSwitcher}
                    onMouseEnter={() => setShowModelList(true)}
                    onMouseLeave={() => setShowModelList(false)}
                >
                    <div style={styles.modelCurrent}>
                        <span style={{ opacity: 0.5, marginRight: '8px' }}>MODEL:</span>
                        {currentModel}
                    </div>

                    {showModelList && (
                        <div
                            style={styles.modelDropdown}
                            // Logic Fix 1: Stop scroll propagation in model list
                            onWheel={(e) => e.stopPropagation()}
                        >
                            {MODELS.map(model => (
                                <div
                                    key={model}
                                    style={{
                                        ...styles.modelOption,
                                        background: currentModel === model ? 'rgba(255,255,255,0.1)' : 'transparent',
                                        color: currentModel === model ? '#00ccff' : '#aaa'
                                    }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setCurrentModel(model);
                                        fetchInternalData(model);
                                        setShowModelList(false);
                                    }}
                                >
                                    {model}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div style={{ opacity: isFeedExpanded ? 0 : 1, ...styles.panelLabel }}>
                    MISSION FEED | {loadingAi ? 'UPLINKING...' : 'ONLINE'}
                </div>

                <div style={{ height: '100%', overflowY: isFeedExpanded ? 'auto' : 'hidden', padding: isFeedExpanded ? '40px' : '0' }}>
                    {loadingAi ? (
                        <div className="loader"></div>
                    ) : errorMsg ? (
                        <div className="error-text">{errorMsg}</div>
                    ) : isFeedExpanded ? (
                        // EXPANDED MAGAZINE VIEW
                        <div style={styles.magazineLayout}>
                            {/* Hero Section (Wiki) */}
                            {wikiData && (
                                <div style={styles.magHero}>
                                    {wikiData.image && <img src={wikiData.image} style={styles.heroImage} alt="Planet" />}
                                    <div style={styles.heroContent}>
                                        <h1 style={styles.magTitle}>{activePlanetData.name} OFFLINE ARCHIVE</h1>
                                        <p style={styles.magIntro}>{wikiData.intro}</p>
                                    </div>
                                </div>
                            )}

                            {/* Main Grid (AI Data) */}
                            <div style={styles.magGrid}>
                                {/* News Column */}
                                <div style={styles.mainCol}>
                                    <h3 style={styles.sectionHeader}>LATEST INTELLIGENCE</h3>
                                    {aiData?.latest_news?.map((news, i) => (
                                        <div key={i} style={styles.newsCard}>
                                            <div style={styles.newsDate}>{news.date}</div>
                                            <div style={styles.newsHead}>{news.headline}</div>
                                            <div style={styles.newsBody}>{news.body}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* Timeline Column */}
                                <div style={styles.sideCol}>
                                    <h3 style={styles.sectionHeader}>HISTORICAL RECORD</h3>
                                    {aiData?.history_timeline?.map((evt, i) => (
                                        <div key={i} style={styles.timelineItem}>
                                            <div style={styles.tDate}>{evt.date}</div>
                                            <div style={styles.tEvent}>{evt.event}</div>
                                        </div>
                                    ))}

                                    <h3 style={{ ...styles.sectionHeader, marginTop: '40px' }}>CULTURAL REFS</h3>
                                    {aiData?.pop_culture?.map((p, i) => (
                                        <div key={i} style={styles.popItem}>• {p}</div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        // COLLAPSED TICKER VIEW
                        <div style={styles.tickerContainer}>
                            <div style={styles.tickerLabel}>LIVE WIRE:</div>
                            <div style={styles.tickerScroll}>
                                {aiData?.latest_news?.map((news, i) => (
                                    <span key={i} style={styles.tickerItem}>
                                        <span style={{ color: '#00ccff' }}>✦</span> {news.headline}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* PANEL 3: RIGHT (Visuals) */}
            <div
                style={{
                    ...styles.panel,
                    ...styles.rightPanel,
                    transform: visible && showRight ? 'translateX(0)' : 'translateX(100%)',
                    pointerEvents: visible && showRight ? 'auto' : 'none'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <button style={styles.sideToggleLeft} onClick={(e) => { e.stopPropagation(); setShowRight(!showRight); }}>
                    {showRight ? '»' : '«'}
                </button>
                <div style={styles.header}>
                    <div style={styles.subtitle}>VISUAL FEED</div>
                </div>
                {/* SCROLLABLE IMAGE GRID */}
                <div style={styles.imageGrid}>
                    {images.map(img => (
                        <div
                            key={img.id}
                            style={{ ...styles.imageSlot, backgroundImage: `url(${img.thumb})` }}
                            onClick={(e) => { e.stopPropagation(); setSelectedImage(img); }}
                        />
                    ))}
                </div>
            </div>

            {/* LIGHTBOX */}
            {selectedImage && (
                <div
                    style={styles.lightbox}
                    onPointerDown={(e) => e.stopPropagation()}
                    onWheel={(e) => e.stopPropagation()}
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setSelectedImage(null);
                    }}
                >
                    <div
                        style={styles.lightboxContent}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img src={selectedImage.thumb} style={styles.lbImg} alt={selectedImage.title} />
                        <div style={styles.lbCaption}>{selectedImage.title}</div>

                        <button
                            style={styles.lbClose}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setSelectedImage(null);
                            }}
                        >
                            CLOSE
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

const DataRow = ({ label, value }) => (
    <div style={styles.dataRow}>
        <span style={styles.dataLabel}>{label}</span>
        <span style={styles.dataValue}>{value}</span>
    </div>
);

const styles = {
    container: { position: 'absolute', width: '100%', height: '100%', top: 0, left: 0, pointerEvents: 'none', overflow: 'hidden', fontFamily: "'Rajdhani', sans-serif" },
    panel: { ...glassStyle, padding: '20px', position: 'absolute', transition: 'all 0.5s ease-in-out' },
    leftPanel: { top: 0, left: 0, bottom: 0, width: '300px', zIndex: 20, display: 'flex', flexDirection: 'column' },
    rightPanel: { top: 0, right: 0, bottom: 0, width: '300px', zIndex: 20, display: 'flex', flexDirection: 'column' },
    bottomPanel: { bottom: 0, left: 0, right: 0, zIndex: 50, display: 'flex', flexDirection: 'column' },

    header: { marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' },
    title: { margin: 0, fontSize: '32px', color: 'white' },
    subtitle: { fontSize: '10px', color: '#00ccff', letterSpacing: '3px', fontWeight: 'bold' },

    dataRow: { display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '5px 0' },
    dataLabel: { color: '#888', fontSize: '12px' },
    dataValue: { color: '#fff', fontFamily: 'monospace' },

    sideToggleRight: { position: 'absolute', right: '-30px', top: '50%', width: '30px', height: '60px', ...glassStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer', pointerEvents: 'auto' },
    sideToggleLeft: { position: 'absolute', left: '-30px', top: '50%', width: '30px', height: '60px', ...glassStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer', pointerEvents: 'auto' },
    bottomToggle: { position: 'absolute', top: '-30px', left: '50%', transform: 'translateX(-50%)', width: '60px', height: '30px', ...glassStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer', pointerEvents: 'auto' },
    dragHandle: { width: '40px', height: '4px', background: 'rgba(255,255,255,0.3)', borderRadius: '2px', margin: '8px auto 0 auto', cursor: 'ns-resize' },
    closeButton: { marginTop: 'auto', background: 'rgba(255,50,50,0.2)', border: '1px solid red', color: 'white', padding: '10px', cursor: 'pointer', pointerEvents: 'auto' },

    panelLabel: { position: 'absolute', top: '20px', left: '20px', color: '#666', fontSize: '10px', letterSpacing: '2px' },
    tickerContainer: { display: 'flex', alignItems: 'center', height: '100%', padding: '0 20px', overflowX: 'auto' },
    tickerLabel: { color: '#00ccff', marginRight: '20px', fontWeight: 'bold' },
    tickerScroll: { display: 'flex', gap: '30px', whiteSpace: 'nowrap' },
    tickerItem: { color: '#fff', fontFamily: 'monospace' },

    magazineLayout: { maxWidth: '1200px', margin: '0 auto', paddingBottom: '100px' },
    magHero: { display: 'flex', gap: '40px', marginBottom: '60px', alignItems: 'center' },
    heroImage: { width: '200px', height: '200px', objectFit: 'cover', borderRadius: '10px', border: '1px solid #fff' },
    heroContent: { flex: 1 },
    magTitle: { fontSize: '48px', margin: '0 0 20px 0', color: '#fff' },
    magIntro: { fontSize: '18px', lineHeight: '1.6', color: '#ddd' },

    magGrid: { display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '60px' },
    sectionHeader: { color: '#00ccff', borderBottom: '1px solid #333', paddingBottom: '10px', marginBottom: '20px' },

    newsCard: { background: 'rgba(255,255,255,0.05)', padding: '20px', marginBottom: '20px' },
    newsDate: { color: '#666', fontSize: '12px', marginBottom: '5px' },
    newsHead: { color: '#fff', fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' },
    newsBody: { color: '#ccc', fontSize: '14px', lineHeight: '1.5' },

    timelineItem: { marginBottom: '20px' },
    tDate: { color: '#00ccff', fontWeight: 'bold' },
    tEvent: { color: '#ccc', fontSize: '13px' },
    popItem: { color: '#888', marginBottom: '5px' },

    imageGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '10px',
        overflowY: 'auto',
        flex: 1,
        padding: '10px',
        scrollbarWidth: 'none'
    },
    imageSlot: { aspectRatio: '1', backgroundSize: 'cover', border: '1px solid #333', cursor: 'pointer' },

    lightbox: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'auto' },
    lightboxContent: { maxWidth: '80%', maxHeight: '80%', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' },
    lbImg: { maxWidth: '100%', maxHeight: '70vh' },
    lbCaption: { color: '#fff', margin: '20px 0' },

    lbClose: {
        position: 'absolute',
        top: '-40px',
        right: '0px',
        background: '#ff3333',
        border: '2px solid white',
        color: '#fff',
        fontWeight: 'bold',
        padding: '10px 30px',
        cursor: 'pointer',
        zIndex: 10001
    },

    modelSwitcher: {
        position: 'absolute',
        top: '10px',
        right: '20px',
        zIndex: 200,
        pointerEvents: 'auto',
        fontFamily: 'monospace'
    },
    modelCurrent: {
        background: 'rgba(0, 0, 0, 0.5)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '20px',
        padding: '8px 16px',
        color: '#aaa',
        fontSize: '12px',
        cursor: 'pointer',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'center'
    },
    modelDropdown: {
        position: 'absolute',
        bottom: '100%',
        right: 0,
        display: 'flex',
        flexDirection: 'column',
        marginBottom: '0',
        paddingBottom: '10px',
        background: 'rgba(10, 10, 14, 0.95)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '8px',
        width: 'max-content',
        maxHeight: '300px',
        overflowY: 'auto',
        boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
    },
    modelOption: {
        padding: '8px 16px',
        fontSize: '12px',
        color: '#aaa',
        cursor: 'pointer',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        transition: 'all 0.2s'
    }
};
