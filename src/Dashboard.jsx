import React, { useState, useEffect } from 'react';
import { useStore } from './store';
import { fetchPlanetData } from './services/ai';

const glassStyle = {
    background: 'rgba(10, 10, 14, 0.7)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.5)'
};

export default function Dashboard() {
    const { activePlanet, activePlanetData, planetFacts, clearSelection } = useStore();
    const [visible, setVisible] = useState(false);

    // New Separate States
    const [showLeft, setShowLeft] = useState(true);
    const [showRight, setShowRight] = useState(true);
    const [showBottom, setShowBottom] = useState(true);

    const [images, setImages] = useState([]);
    const [loadingImages, setLoadingImages] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null); // For Lightbox

    // AI Data State
    const [aiData, setAiData] = useState(null);
    const [loadingAi, setLoadingAi] = useState(false);

    useEffect(() => {
        if (activePlanetData) {
            setVisible(true);
            setSelectedImage(null); // Reset Lightbox

            // 1. Fetch AI Data (Deep Stats & Intel)
            const getAiData = async () => {
                setLoadingAi(true);
                setAiData(null);
                const data = await fetchPlanetData(activePlanetData.name);
                if (data) {
                    setAiData(data);
                }
                setLoadingAi(false);
            };
            getAiData();

            // 2. Fetch Images (Previous Logic)
            const fetchImages = async () => {
                setLoadingImages(true);
                setImages([]);
                try {
                    const query = activePlanetData.name;
                    const response = await fetch(`https://images-api.nasa.gov/search?q=${query}&media_type=image`);
                    const data = await response.json();

                    if (data.collection && data.collection.items) {
                        // Get top 4 images
                        const items = data.collection.items.slice(0, 4).map(item => ({
                            id: item.data[0].nasa_id,
                            title: item.data[0].title,
                            desc: item.data[0].description,
                            thumb: item.links && item.links[0] ? item.links[0].href : '',
                        })).filter(i => i.thumb); // Ensure we have a link
                        setImages(items);
                    }
                } catch (err) {
                    console.error("Failed to fetch NASA images", err);
                }
                setLoadingImages(false);
            };
            fetchImages();

        } else {
            setVisible(false);
            setImages([]);
        }
    }, [activePlanetData]);

    if (!activePlanetData) return (
        <div style={styles.statusBar}>
            <span style={styles.statusLabel}>SYSTEM STATUS:</span> IDLE
            <span style={{ margin: '0 10px' }}>|</span>
            <span style={styles.statusLabel}>DATE:</span> {new Date().toLocaleDateString()}
        </div>
    );

    return (
        <div style={styles.container}>
            {/* PANEL 1: TELEMETRY (LEFT Sidebar) */}
            <div
                style={{
                    ...styles.panel,
                    ...styles.leftPanel,
                    transform: visible && showLeft ? 'translateX(0)' : 'translateX(-100%)',
                    pointerEvents: visible && showLeft ? 'auto' : 'none'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* GLOBAL/LEFT TOGGLE DOCKED */}
                <button
                    style={styles.sideToggleRight}
                    onClick={(e) => { e.stopPropagation(); setShowLeft(!showLeft); }}
                >
                    {showLeft ? '«' : '»'}
                </button>

                <div style={styles.header}>
                    <h1 style={styles.title}>{activePlanetData.name.toUpperCase()}</h1>
                    <div style={styles.subtitle}>OFFICIAL DESIGNATION</div>
                </div>

                <div style={styles.section}>
                    <div style={styles.sectionTitle}>TELEMETRY</div>
                    <div style={styles.dataGrid}>
                        <DataRow label="Type" value={activePlanetData.type || 'Planet'} />
                        <DataRow label="Radius" value={activePlanetData.size ? `${activePlanetData.size} Units` : 'N/A'} />
                        <DataRow label="Orbit Dist" value={activePlanetData.a ? `${activePlanetData.a} AU` : 'N/A'} />

                        {loadingAi ? (
                            <div style={{ color: '#00ccff', fontSize: '12px', fontStyle: 'italic', padding: '10px 0' }}>
                                DECRYPTING DEEP SCANS...
                            </div>
                        ) : aiData && aiData.deepStats ? (
                            aiData.deepStats.map((stat, idx) => (
                                <DataRow key={idx} label={stat.label} value={stat.value} />
                            ))
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                <DataRow label="Orbital Period" value="365 Days" />
                                <DataRow label="Gravity" value="9.8 m/s²" />
                            </div>
                        )}
                    </div>
                </div>

                <div style={styles.section}>
                    <div style={styles.sectionTitle}>DESCRIPTION</div>
                    <p style={styles.text}>{activePlanetData.description}</p>
                </div>

                <button style={styles.closeButton} onClick={(e) => { e.stopPropagation(); clearSelection(); }}>
                    TERMINATE SESSION
                </button>
            </div>

            {/* PANEL 2: INTEL FEED (BOTTOM Bar) */}
            <div
                style={{
                    ...styles.panel,
                    ...styles.bottomPanel,
                    transform: visible && showBottom ? 'translateY(0)' : 'translateY(100%)',
                    pointerEvents: visible && showBottom ? 'auto' : 'none'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    style={styles.bottomToggle}
                    onClick={(e) => { e.stopPropagation(); setShowBottom(!showBottom); }}
                >
                    {showBottom ? 'v' : '^'}
                </button>
                <div style={styles.panelLabel}>
                    MISSION INTEL <span style={{ opacity: 0.5, marginLeft: '20px', fontWeight: 'normal' }}>SYSTEM STATUS: ONLINE. Awaiting AI Data Stream...</span>
                </div>
                {loadingAi ? (
                    <div style={{ color: '#00ccff', fontSize: '14px', padding: '30px', fontFamily: 'monospace', textAlign: 'center', width: '100%' }}>
                        ESTABLISHING SECURE UPLINK...
                    </div>
                ) : aiData ? (
                    <div style={styles.intelGrid}>
                        {/* COLUMN 1: SUMMARY */}
                        <div style={styles.intelColumn}>
                            <div style={styles.intelTitle}>EXECUTIVE SUMMARY</div>
                            <p style={styles.intelText}>{aiData.summary || "No data available."}</p>
                        </div>

                        {/* COLUMN 2: DISCOVERIES */}
                        <div style={styles.intelColumn}>
                            <div style={styles.intelTitle}>RECENT DISCOVERIES</div>
                            <ul style={styles.intelList}>
                                {aiData.discoveries && aiData.discoveries.map((item, idx) => (
                                    <li key={idx}>{item}</li>
                                ))}
                            </ul>
                        </div>

                        {/* COLUMN 3: THEORIES */}
                        <div style={styles.intelColumn}>
                            <div style={styles.intelTitle}>ACTIVE THEORIES</div>
                            <ul style={styles.intelList}>
                                {aiData.keyTheories && aiData.keyTheories.map((item, idx) => (
                                    <li key={idx}>{item}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                ) : (
                    <div style={{ ...styles.intelGrid, opacity: 0.5 }}>
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#ff5555', padding: '20px' }}>
                            OFFLINE MODE: UNABLE TO CONTACT MISSION CONTROL.
                        </div>
                    </div>
                )}
            </div>

            {/* PANEL 3: VISUALS DRAWER (RIGHT Sidebar) */}
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

                {loadingImages ? (
                    <div style={{ color: '#666', fontSize: '12px', padding: '20px' }}>ESTABLISHING UPLINK...</div>
                ) : (
                    <div style={styles.imageGrid}>
                        {images.length > 0 ? images.map(img => (
                            <div
                                key={img.id}
                                style={{ ...styles.imageSlot, backgroundImage: `url(${img.thumb})`, backgroundSize: 'cover' }}
                                onClick={(e) => { e.stopPropagation(); setSelectedImage(img); }}
                            >
                                {!img.thumb && 'NO SIGNAL'}
                            </div>
                        )) : (
                            <div style={{ gridColumn: '1 / -1', color: '#444', fontSize: '10px', textAlign: 'center', padding: '20px' }}>
                                NO VISUAL DATA AVAILABLE
                            </div>
                        )}
                    </div>
                )}

                <div style={{ ...styles.sectionTitle, marginTop: '20px' }}>LATEST TRANSMISSION</div>
            </div>

            {/* LIGHTBOX OVERLAY */}
            {selectedImage && (
                <div
                    style={styles.lightbox}
                    onClick={(e) => { e.stopPropagation(); setSelectedImage(null); }}
                >
                    <div style={styles.lightboxContent} onClick={e => e.stopPropagation()}>
                        <img src={selectedImage.thumb} style={styles.lightboxImg} alt={selectedImage.title} />
                        <div style={styles.lightboxCaption}>
                            <h3>{selectedImage.title}</h3>
                            <p>{selectedImage.desc}</p>
                        </div>
                        <button
                            style={styles.lightboxClose}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                console.log("Image Closed via Button");
                                setSelectedImage(null);
                            }}
                        >
                            CLOSE INFO
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

const TimelineItem = ({ year, event }) => (
    <div style={styles.timelineItem}>
        <div style={styles.timelineYear}>{year}</div>
        <div style={styles.timelineEvent}>{event}</div>
    </div>
);

const styles = {
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        overflow: 'hidden',
        fontFamily: "'Rajdhani', sans-serif",
    },
    statusBar: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        color: '#888',
        fontSize: '12px',
        fontFamily: 'monospace',
        zIndex: 100,
    },
    statusLabel: { color: '#555', fontWeight: 'bold' },
    panel: {
        ...glassStyle,
        padding: '20px',
        position: 'absolute',
        pointerEvents: 'auto',
        transition: 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)',
    },
    leftPanel: {
        top: 0,
        left: 0,
        bottom: 0,
        width: '300px',
        borderRight: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 20, // Sit on top of bottom bar
        overflowY: 'visible',
    },
    bottomPanel: {
        position: 'fixed',
        bottom: 0,
        left: 0,   // Full width
        right: 0,  // Full width
        height: '200px',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    },
    rightPanel: {
        top: 0,
        right: 0,
        bottom: 0,
        width: '300px',
        borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
        zIndex: 20, // Sit on top of bottom bar
        overflowY: 'visible',
    },
    header: { marginBottom: '20px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '10px' },
    title: { margin: 0, fontSize: '32px', fontWeight: '700', color: 'white', letterSpacing: '2px' },
    subtitle: { fontSize: '10px', color: '#00ccff', letterSpacing: '3px', fontWeight: 'bold' },
    section: { marginBottom: '25px' },
    sectionTitle: { fontSize: '12px', color: '#666', fontWeight: 'bold', marginBottom: '10px', letterSpacing: '1px' },
    text: { fontSize: '14px', lineHeight: '1.5', color: '#ccc', margin: 0 },
    dataGrid: { display: 'flex', flexDirection: 'column', gap: '8px' },
    dataRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '4px' },
    dataLabel: { fontSize: '12px', color: '#888' },
    dataValue: { fontSize: '14px', color: '#fff', fontFamily: 'monospace' },
    closeButton: {
        marginTop: 'auto',
        background: 'rgba(255, 50, 50, 0.1)',
        border: '1px solid rgba(255, 50, 50, 0.3)',
        color: '#ff5555',
        padding: '12px',
        cursor: 'pointer',
        fontWeight: 'bold',
        letterSpacing: '2px',
        width: '100%',
        transition: 'all 0.2s',
    },
    panelLabel: { position: 'absolute', top: '10px', left: '20px', fontSize: '10px', color: '#666', letterSpacing: '2px', fontWeight: 'bold' },
    timeline: { display: 'flex', gap: '40px', marginTop: '25px', overflowX: 'auto', paddingBottom: '10px' },
    timelineItem: { display: 'flex', flexDirection: 'column', minWidth: '100px' },
    timelineYear: { fontSize: '12px', color: '#00ccff', fontWeight: 'bold' },
    timelineEvent: { fontSize: '11px', color: '#aaa', marginTop: '4px' },
    sideToggleLeft: {
        position: 'absolute',
        left: '-30px',
        top: '50%',
        width: '30px',
        height: '60px',
        ...glassStyle,
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRight: 'none',
        color: '#fff',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderTopLeftRadius: '5px',
        borderBottomLeftRadius: '5px',
        pointerEvents: 'auto', // Always clickable
    },
    sideToggleRight: {
        position: 'absolute',
        right: '-30px',
        top: '50%',
        width: '30px',
        height: '60px',
        ...glassStyle,
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderLeft: 'none',
        color: '#fff',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderTopRightRadius: '5px',
        borderBottomRightRadius: '5px',
        pointerEvents: 'auto', // Always clickable
    },
    bottomToggle: {
        position: 'absolute',
        top: '-24px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '60px',
        height: '24px',
        ...glassStyle,
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderBottom: 'none',
        color: '#fff',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderTopLeftRadius: '10px',
        borderTopRightRadius: '10px',
        fontSize: '12px',
        pointerEvents: 'auto', // Always clickable
    },
    imageGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' },
    imageSlot: {
        aspectRatio: '1',
        background: 'rgba(0,0,0,0.3)',
        border: '1px solid #333',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#444',
        fontSize: '10px',
        cursor: 'pointer',
        transition: 'border-color 0.2s',
    },
    intelGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: '40px',
        marginTop: '30px',
        padding: '0 20px',
        height: '100%',
        overflowY: 'auto'
    },
    intelColumn: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
    },
    intelTitle: {
        fontSize: '12px',
        color: '#00ccff',
        fontWeight: 'bold',
        borderBottom: '1px solid rgba(0, 204, 255, 0.3)',
        paddingBottom: '5px',
        marginBottom: '5px',
        letterSpacing: '1px'
    },
    intelText: {
        fontSize: '13px',
        color: '#ccc',
        lineHeight: '1.6'
    },
    intelList: {
        fontSize: '13px',
        color: '#ccc',
        lineHeight: '1.6',
        paddingLeft: '20px',
        margin: 0
    },
    lightbox: {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0,0,0,0.8)',
        backdropFilter: 'blur(10px)',
        zIndex: 3000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px'
    },
    lightboxContent: {
        background: 'rgba(10, 10, 15, 0.95)',
        border: '1px solid #444',
        maxWidth: '800px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
    },
    lightboxImg: {
        width: '100%',
        height: 'auto',
        maxHeight: '60vh',
        objectFit: 'contain',
    },
    lightboxCaption: {
        padding: '20px',
        overflowY: 'auto',
        maxHeight: '20vh',
        color: '#ccc',
        fontSize: '14px',
    },
    lightboxClose: {
        background: 'rgba(50, 50, 50, 0.5)',
        border: 'none',
        borderTop: '1px solid #444',
        color: '#fff',
        padding: '15px',
        cursor: 'pointer',
        fontFamily: 'inherit',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        transition: 'background 0.2s',
        letterSpacing: '2px',
    },
};
