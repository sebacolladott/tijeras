import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarInset,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
    useSidebar,
} from '@/components/ui/sidebar';
import { useApp } from '@/hooks/useApp';
import BarbersPage from '@/pages/BarbersPage';
import ClientDetailsPage from '@/pages/ClientDetailsPage';
import ClientsPage from '@/pages/ClientsPage';
import CutDetailsPage from '@/pages/CutDetailsPage';
import CutsPage from '@/pages/CutsPage';
import {
    EllipsisVerticalIcon,
    LogOutIcon,
    ScissorsIcon,
    UserIcon,
    UsersIcon,
} from 'lucide-react';
import 'react-photo-view/dist/react-photo-view.css';
import {
    Link,
    Navigate,
    Route,
    Routes,
    useLocation,
    useNavigate,
} from 'react-router';

export default function DashboardLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const { isMobile } = useSidebar();
    const { user, logout } = useApp();

    const menus = [
        {
            path: '/cuts',
            title: 'Cortes',
            icon: <ScissorsIcon />,
        },
        {
            path: '/clients',
            title: 'Clientes',
            icon: <UsersIcon />,
        },
        {
            path: '/barbers',
            title: 'Barberos',
            icon: <UserIcon />,
        },
    ];

    return (
        <>
            <Sidebar collapsible="icon">
                <SidebarHeader></SidebarHeader>
                <SidebarContent>
                    <SidebarGroup>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {menus.map(({ path, title, icon }) => (
                                    <SidebarMenuItem key={path}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={location.pathname.startsWith(
                                                path,
                                            )}
                                        >
                                            <Link
                                                to={path}
                                                className="flex items-center"
                                            >
                                                {icon}
                                                <span>{title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>
                <SidebarFooter>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <SidebarMenuButton
                                        size="lg"
                                        className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                                    >
                                        <Avatar className="h-8 w-8 rounded-lg">
                                            <AvatarImage
                                                src="logo.png"
                                                alt="tijeras-logo"
                                            />
                                            <AvatarFallback>TS</AvatarFallback>
                                        </Avatar>
                                        <div className="grid flex-1 text-left text-sm leading-tight">
                                            <span className="truncate font-medium">
                                                TIJERAS
                                            </span>
                                            <span className="text-muted-foreground truncate text-xs">
                                                {user?.role ?? ''}
                                            </span>
                                        </div>
                                        <EllipsisVerticalIcon className="ml-auto size-4" />
                                    </SidebarMenuButton>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                                    side={isMobile ? 'bottom' : 'right'}
                                    align="end"
                                    sideOffset={4}
                                >
                                    <DropdownMenuItem
                                        onClick={() => {
                                            logout();
                                            navigate('/login');
                                        }}
                                    >
                                        <LogOutIcon />
                                        Cerrar sesión
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarFooter>
                <SidebarRail />
            </Sidebar>
            <SidebarInset className="flex-1 overflow-auto bg-gradient-to-br from-background to-primary/10 text-foreground">
                <Routes>
                    <Route path="/cuts" element={<CutsPage />} />
                    <Route path="/cuts/:id" element={<CutDetailsPage />} />
                    <Route path="/clients" element={<ClientsPage />} />
                    <Route
                        path="/clients/:id"
                        element={<ClientDetailsPage />}
                    />
                    <Route path="/barbers" element={<BarbersPage />} />
                    <Route path="*" element={<Navigate to="/cuts" replace />} />
                </Routes>
            </SidebarInset>
        </>
    );
}
