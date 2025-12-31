import React, { useState, useEffect } from 'react';
import { useStore } from './store';
import { fetchPlanetData } from './services/ai';

const glassStyle = {
    background: 'rgba(10, 10, 14, 0.7)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.5)'
};

const sessionCache = {};

export default function Dashboard() {
    const { activePlanet, activePlanetData, clearSelection } = useStore();

    // UI Visibility States
    const [visible, setVisible] = useState(false);
    const [showLeft, setShowLeft] = useState(true);
    const [showRight, setShowRight] = useState(true);
    const [showBottom, setShowBottom] = useState(true);
    const [isFeedExpanded, setIsFeedExpanded] = useState(false);

    // Data States
    const [aiData, setAiData] = useState(null);
    const [dataSource, setDataSource] = useState(''); // 'Local Archive' | 'Live Uplink' | 'System Alert'
    const [loadingAi, setLoadingAi] = useState(false);
    const [wikiData, setWikiData] = useState(null);
    const [images, setImages] = useState([]); // NASA Images
    const [selectedImage, setSelectedImage] = useState(null);

    useEffect(() => {
        if (activePlanetData) {
            setVisible(true);
            setAiData(null);
            setWikiData(null);
            setImages([]);
            setIsFeedExpanded(false); // Reset expansion on planet change

            // 1. Fetch AI Data
            const getAiData = async () => {
                const cacheKey = `ai_data_${activePlanetData.name}`;
                const cached = sessionCache[cacheKey];

                if (cached) {
                    try {
                        setAiData(cached);
                        return;
                    } catch (e) {
                        // Should not happen with object cache, but safe to ignore
                    }
                }

                setLoadingAi(true);
                try {
                    const data = await fetchPlanetData(activePlanetData.name);
                    if (data) {
                        setAiData(data);
                        sessionCache[cacheKey] = data;
                    }
                } catch (err) {
                    console.error("AI Fetch Error", err);
                    if (err.message && err.message.includes("429")) {
                        setAiData({
                            latest_news: [{ headline: "Data Limit Reached.", date: "System Alert", body: "Using cached archive protocols. Live uplink failed." }],
                            history_timeline: [{ date: "2024", event: "Connection Limit Exceeded" }],
                            pop_culture: ["System Offline"]
                        });
                    } else {
                        setAiData({
                            latest_news: [{ headline: "Uplink Failed", date: "Now", body: "Connection to Mission Control interrupted." }]
                        });
                    }
                }
                setLoadingAi(false);
            };
            getAiData();

            // 2. Fetch Wikipedia Data (Summary & Image)
            const getWikiData = async () => {
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
            };
            getWikiData();

            // 3. Fetch NASA Images (Preserved Logic)
            const fetchImages = async () => {
                try {
                    const response = await fetch(`https://images-api.nasa.gov/search?q=${activePlanetData.name}&media_type=image`);
                    const data = await response.json();
                    if (data.collection?.items) {
                        const items = data.collection.items.slice(0, 4).map(item => ({
                            id: item.data[0].nasa_id,
                            title: item.data[0].title,
                            desc: item.data[0].description,
                            thumb: item.links?.[0]?.href || '',
                        })).filter(i => i.thumb);
                        setImages(items);
                    }
                } catch (err) { console.error(err); }
            };
            fetchImages();

        } else {
            setVisible(false);
        }
    }, [activePlanetData]);

    // Scroll Logic
    const handleWheel = (e) => {
        if (e.deltaY < -10 && !isFeedExpanded) {
            setIsFeedExpanded(true);
        } else if (e.deltaY > 10 && isFeedExpanded && e.currentTarget.scrollTop === 0) {
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
                    transform: visible && showBottom ? 'translateY(0)' : 'translateY(100%)',
                    pointerEvents: visible && showBottom ? 'auto' : 'none',
                    height: isFeedExpanded ? '100%' : '200px',
                    top: isFeedExpanded ? 0 : 'auto',
                    background: isFeedExpanded ? 'rgba(5, 5, 8, 0.98)' : glassStyle.background
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

                <div style={{ opacity: isFeedExpanded ? 0 : 1, ...styles.panelLabel }}>
                    MISSION FEED | {loadingAi ? 'UPLINKING...' : 'ONLINE'}
                </div>

                <div style={{ height: '100%', overflowY: isFeedExpanded ? 'auto' : 'hidden', padding: isFeedExpanded ? '40px' : '0' }}>
                    {isFeedExpanded ? (
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
                <div style={styles.lightbox} onClick={(e) => { e.stopPropagation(); setSelectedImage(null); }}>
                    <div style={styles.lightboxContent}>
                        <img src={selectedImage.thumb} style={styles.lbImg} />
                        <div style={styles.lbCaption}>{selectedImage.title}</div>
                        <button style={styles.lbClose} onClick={(e) => {
                            e.preventDefault(); e.stopPropagation(); setSelectedImage(null);
                        }}>CLOSE</button>
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
    rightPanel: { top: 0, right: 0, bottom: 0, width: '300px', zIndex: 20 },
    bottomPanel: { bottom: 0, left: 0, right: 0, zIndex: 10, display: 'flex', flexDirection: 'column' },

    // Header/Text
    header: { marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' },
    title: { margin: 0, fontSize: '32px', color: 'white' },
    subtitle: { fontSize: '10px', color: '#00ccff', letterSpacing: '3px', fontWeight: 'bold' },

    // DataRow
    dataRow: { display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '5px 0' },
    dataLabel: { color: '#888', fontSize: '12px' },
    dataValue: { color: '#fff', fontFamily: 'monospace' },

    // Toggles
    sideToggleRight: { position: 'absolute', right: '-30px', top: '50%', width: '30px', height: '60px', ...glassStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer', pointerEvents: 'auto' },
    sideToggleLeft: { position: 'absolute', left: '-30px', top: '50%', width: '30px', height: '60px', ...glassStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer', pointerEvents: 'auto' },
    bottomToggle: { position: 'absolute', top: '-30px', left: '50%', transform: 'translateX(-50%)', width: '60px', height: '30px', ...glassStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer', pointerEvents: 'auto' },
    dragHandle: { width: '40px', height: '4px', background: 'rgba(255,255,255,0.3)', borderRadius: '2px', margin: '8px auto 0 auto', cursor: 'ns-resize' },
    closeButton: { marginTop: 'auto', background: 'rgba(255,50,50,0.2)', border: '1px solid red', color: 'white', padding: '10px', cursor: 'pointer', pointerEvents: 'auto' },

    // Feed Layout
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

    // Visuals
    imageGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' },
    imageSlot: { aspectRatio: '1', backgroundSize: 'cover', border: '1px solid #333', cursor: 'pointer' },

    // Lightbox
    lightbox: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' },
    lightboxContent: { maxWidth: '80%', maxHeight: '80%', display: 'flex', flexDirection: 'column', alignItems: 'center' },
    lbImg: { maxWidth: '100%', maxHeight: '70vh' },
    lbCaption: { color: '#fff', margin: '20px 0' },
    lbClose: { background: 'transparent', border: '1px solid #fff', color: '#fff', padding: '10px 30px', cursor: 'pointer' }
};
