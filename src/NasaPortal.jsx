import React from 'react';
import { useStore } from './store';

export default function NasaPortal() {
    const setNasaPortalOpen = useStore(state => state.setNasaPortalOpen);

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 2000,
            background: 'black',
            display: 'flex',
            flexDirection: 'column'
        }}>
            {/* Toolbar */}
            <div style={{
                height: '50px',
                background: '#000',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0 20px',
                borderBottom: '1px solid #333'
            }}>
                <div style={{ color: 'white', fontFamily: "'Rajdhani', sans-serif", fontSize: '20px', fontWeight: 'bold' }}>
                    <span style={{ color: '#0b3d91' }}>NASA</span> Eyes Integration
                </div>
                <button
                    onClick={() => setNasaPortalOpen(false)}
                    style={{
                        background: 'transparent',
                        border: '1px solid white',
                        color: 'white',
                        padding: '8px 16px',
                        cursor: 'pointer',
                        fontFamily: "'Rajdhani', sans-serif",
                        textTransform: 'uppercase',
                        borderRadius: '4px',
                        transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => { e.target.style.background = 'white'; e.target.style.color = 'black'; }}
                    onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = 'white'; }}
                >
                    Return to Solar System
                </button>
            </div>

            {/* The Iframe */}
            <iframe
                src="https://eyes.nasa.gov/apps/earth/"
                style={{
                    width: '100%',
                    height: 'calc(100% - 50px)',
                    border: 'none'
                }}
                title="NASA Eyes on the Earth"
            />
        </div>
    );
}
