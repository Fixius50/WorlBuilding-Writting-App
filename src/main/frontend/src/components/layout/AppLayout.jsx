import { Outlet } from 'react-router-dom';
import TopNavBar from './TopNavBar';

const AppLayout = () => {
    return (
        <div className="flex h-screen w-full overflow-hidden bg-background-dark relative">
            <main className="flex-1 min-w-0 relative overflow-hidden flex flex-col">
                <Outlet />
            </main>
        </div>
    );
};

export default AppLayout;
