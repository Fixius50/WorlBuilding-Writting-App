import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const AppLayout = () => {
    return (
        <div className="flex h-screen w-full overflow-hidden bg-background-dark">
            <Sidebar />
            <main className="flex-1 min-w-0 relative overflow-hidden flex flex-col">
                <Outlet />
            </main>
        </div>
    );
};

export default AppLayout;
