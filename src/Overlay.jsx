import React from 'react';
import { useStore } from './store';

export default function Overlay() {
    const { activePlanet, activePlanetData, planetFacts } = useStore();

    return (
        <div style={styles.container}>
            {!activePlanetData && (
                <div style={styles.statusBar}>
                    <span style={styles.statusLabel}>SYSTEM STATUS:</span> IDLE
                    <span style={{ margin: '0 10px' }}>|</span>
                    <span style={styles.statusLabel}>DATE:</span> {new Date().toLocaleDateString()}
                </div>
            )}

            {activePlanetData && (
                <div style={styles.sidebar}>
                    <div style={styles.header}>
                        <h1 style={styles.title}>{activePlanet.toUpperCase()}</h1>
                        <div style={styles.subtitle}>PLANETARY BODY</div>
                    </div>

                    <div style={styles.section}>
                        <div style={styles.sectionTitle}>DESCRIPTION</div>
                        <p style={styles.text}>{activePlanetData.description}</p>
                    </div>

                    <div style={styles.section}>
                        <div style={styles.sectionTitle}>ORBITAL DATA (J2000)</div>
                        <div style={styles.grid}>
                            <div style={styles.gridItem}>
                                <div style={styles.label}>Semi-Major Axis (a)</div>
                                <div style={styles.value}>{activePlanetData.a} AU</div>
                            </div>
                            <div style={styles.gridItem}>
                                <div style={styles.label}>Eccentricity (e)</div>
                                <div style={styles.value}>{activePlanetData.e}</div>
                            </div>
                            <div style={styles.gridItem}>
                                <div style={styles.label}>Inclination (i)</div>
                                <div style={styles.value}>{activePlanetData.i}°</div>
                            </div>
                            <div style={styles.gridItem}>
                                <div style={styles.label}>Mean Anomaly (M)</div>
                                <div style={styles.value}>{activePlanetData.M}°</div>
                            </div>
                        </div>
                    </div>

                    {activePlanetData.fact && (
                        <div style={styles.section}>
                            <div style={styles.sectionTitle}>ANALYSIS NOTE</div>
                            <p style={styles.text}>{activePlanetData.fact}</p>
                        </div>
                    )}

                    <div style={styles.footer}>
                        <button
                            style={styles.button}
                            onClick={(e) => { e.stopPropagation(); useStore.getState().clearSelection(); }}
                        >
                            RESET VIEW
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

const styles = {
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        display: 'flex',
        justifyContent: 'flex-end',
        color: '#fff',
        zIndex: 100, // Ensure it sits on top of Canvas
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
    statusLabel: {
        color: '#555',
        fontWeight: 'bold',
    },
    sidebar: {
        width: '300px',
        height: '100%',
        backgroundColor: '#1e1e1e',
        borderLeft: '1px solid #333',
        padding: '30px', // Reduced padding for narrower width
        pointerEvents: 'auto',
        overflowY: 'auto',
        boxSizing: 'border-box',
    },
    header: {
        marginBottom: '40px',
        borderBottom: '1px solid #333',
        paddingBottom: '20px',
    },
    title: {
        margin: 0,
        fontSize: '36px',
        fontWeight: '700',
        letterSpacing: '-1px',
    },
    subtitle: {
        fontSize: '12px',
        color: '#888',
        marginTop: '5px',
        letterSpacing: '2px',
    },
    section: {
        marginBottom: '40px',
    },
    sectionTitle: {
        fontSize: '11px',
        fontWeight: '700',
        color: '#888',
        marginBottom: '15px',
        textTransform: 'uppercase',
        letterSpacing: '1px',
    },
    text: {
        fontSize: '14px',
        lineHeight: '1.6',
        color: '#ddd',
        margin: 0,
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '20px',
    },
    gridItem: {
        display: 'flex',
        flexDirection: 'column',
    },
    label: {
        fontSize: '11px',
        color: '#666',
        marginBottom: '5px',
    },
    value: {
        fontSize: '14px',
        color: '#fff',
        fontFamily: 'monospace',
    },
    footer: {
        marginTop: 'auto',
        paddingTop: '20px',
        borderTop: '1px solid #333',
    },
    button: {
        background: 'transparent',
        border: '1px solid #555',
        color: '#fff',
        padding: '10px 20px',
        cursor: 'pointer',
        fontSize: '12px',
        textTransform: 'uppercase',
        transition: 'background 0.2s',
        width: '100%',
    },
    resetButton: {
        position: 'absolute',
        top: 20,
        left: 20,
        background: 'rgba(30, 30, 30, 0.8)',
        border: '1px solid #555',
        color: '#fff',
        padding: '10px 20px',
        cursor: 'pointer',
        fontSize: '12px',
        textTransform: 'uppercase',
        pointerEvents: 'auto',
        zIndex: 1000,
    }
};
