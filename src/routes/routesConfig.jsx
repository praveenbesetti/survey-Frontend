// src/routes/routesConfig.js
import { Landing } from '../pages/Landing';
import { Shop } from '../pages/Shop';
import { Cart } from '../pages/Cart';
import { Checkout } from '../pages/Checkout';
import { Categories } from '../pages/Categories';
import { SurveyForm } from '../pages/SurveyForm';
import { Admin } from "../pages/admin";
import { SubAgentManager } from '../pages/SubAgentManager';
import { AgentManager } from '../pages/agentManagement';

export const protectedRoutes = [
    { path: "/", element: <Landing /> },
    { path: "/categories", element: <Categories /> },
    { path: "/survey", element: <SurveyForm /> },
    { path: "/shop", element: <Shop /> },
    { path: "/cart", element: <Cart /> },
    { path: "/checkout", element: <Checkout /> },
    { path: "/admin-Dashboard", element: <Admin /> },
    { path: "/sub-agent-details", element: <SubAgentManager /> },
    {path:"/agent-details", element:<AgentManager />}
];