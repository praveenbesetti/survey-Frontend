// src/routes/routesConfig.js
import { Landing } from '../pages/Landing';
import { Shop } from '../pages/Shop';
import { Cart } from '../pages/Cart';
import { Checkout } from '../pages/Checkout';
import { Categories } from '../pages/Categories';
import { SurveyForm } from '../pages/SurveyForm';
import { Admin } from "../pages/admin"; // Note: ensure casing matches your file system
import { SubAgentManager } from '../pages/SubAgentManager';
import { AgentManager } from '../pages/agentManagement';
import { SurveyManager } from '../pages/SurveyManager';

export const protectedRoutes = [
    // Public-facing but inside HariyaliMart Portal
    { path: "/", element: <Landing /> },
    { path: "/categories", element: <Categories /> },
    { path: "/shop", element: <Shop /> },
    // { path: "/cart", element: <Cart /> },
    // { path: "/checkout", element: <Checkout /> },
    // { path: "/survey", element: <SurveyForm /> },

    // Partner/Admin Specific Dashboards
    { path: "/admin-Dashboard", element: <Admin /> },
    { path: "/sub-agent-details", element: <SubAgentManager /> },
    { path: "/agent-details", element: <AgentManager /> },
    {path: "/surveyManagment", element:<SurveyManager/>
    }
];