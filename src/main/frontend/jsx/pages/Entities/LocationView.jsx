import GlassPanel from '../../components/common/GlassPanel';

const LocationView = ({ id }) => {
    return (
        <div className="p-8">
            <GlassPanel className="p-8 text-center">
                <h1 className="text-2xl text-white mb-2">Location View</h1>
                <p className="text-slate-400">Viewing Location ID: {id}</p>
                <div className="mt-8 p-4 bg-surface-light rounded-lg inline-block">
                    <span className="material-symbols-outlined text-4xl text-emerald-400">map</span>
                </div>
            </GlassPanel>
        </div>
    );
};

export default LocationView;
