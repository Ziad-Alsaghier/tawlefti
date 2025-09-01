import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { CartProvider } from './contexts/CartContext';
import { WishlistProvider } from './contexts/WishlistContext';
import { Toaster } from 'sonner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './components/ThemeProvider';

// Layouts
import AdminLayout from './components/admin/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/MainLayout';

// Pages
import Index from './pages/Index';
import MethodPage from './pages/MethodPage';
import ResultsPage from './pages/ResultsPage';
import BlendDetailPage from './pages/BlendDetailPage';
import CheckoutPage from './pages/CheckoutPage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUp';
import UpdatePasswordPage from './pages/UpdatePasswordPage';
import NotFound from './pages/NotFound';
import FunctionalBlendsPage from './pages/FunctionalBlendsPage';
import ProfilePage from './pages/ProfilePage';
import AboutPage from './pages/AboutPage';
import FaqPage from './pages/FaqPage';
import ContactPage from './pages/ContactPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdvancedAnalytics from './pages/admin/AdvancedAnalytics';
import CustomersManager from './pages/admin/CustomersManager';
import CustomerDetailsPage from './pages/admin/CustomerDetailsPage';
import UsersManager from './pages/admin/UsersManager';
import FinancialSummary from './pages/admin/accounting/FinancialSummary';
import GeneralLedger from './pages/admin/accounting/GeneralLedger';
import SalesReports from './pages/admin/accounting/SalesReports';
import ExpensesManager from './pages/admin/accounting/ExpensesManager';
import PurchasesLog from './pages/admin/accounting/PurchasesLog';
import ExpenseCategoriesManager from './pages/admin/accounting/ExpenseCategoriesManager';
import RoasteryPayoutsManager from './pages/admin/accounting/RoasteryPayoutsManager';
import FixedCostsManager from './pages/admin/accounting/FixedCostsManager';
import RoasteryManager from './pages/admin/RoasteryManager';
import InventoryManager from './pages/admin/InventoryManager';
import BlendsManager from './pages/admin/BlendsManager';
import CoffeeTypesManager from './pages/admin/CoffeeTypesManager';
import AdditivesManager from './pages/admin/AdditivesManager';
import MethodsManager from './pages/admin/MethodsManager';
import DiscountsManager from './pages/admin/DiscountsManager';
import StoreSettings from './pages/admin/StoreSettings';
import LoyaltySettings from './pages/admin/LoyaltySettings';
import NotificationsManager from './pages/admin/NotificationsManager';
import SuppliersManager from './pages/admin/accounting/SuppliersManager';
import FixedExpensesManager from './pages/admin/accounting/FixedExpensesManager';
import SalariesManager from './pages/admin/accounting/SalariesManager';
import ContentManager from './pages/admin/ContentManager';

// Roaster Page
import LiveOperationsPage from './pages/roaster/LiveOperationsPage';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AuthProvider>
          <WishlistProvider>
            <CartProvider>
              <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
                <Toaster richColors position="bottom-right" />

                {/* Router (Ensure react-router-dom is >= v6.22) */}
                <Router>
                  <Routes>
                    {/* Public Routes with Main Layout */}
                    <Route element={<MainLayout />}>
                      <Route path="/" element={<Index />} />
                      <Route path="/functional-blends" element={<FunctionalBlendsPage />} />
                      <Route path="/method/:methodId" element={<MethodPage />} />
                      <Route path="/results/:methodId" element={<ResultsPage />} />
                      <Route path="/blend/:blendCode" element={<BlendDetailPage />} />
                      <Route path="/checkout" element={<CheckoutPage />} />
                      <Route path="/about" element={<AboutPage />} />
                      <Route path="/faq" element={<FaqPage />} />
                      <Route path="/contact" element={<ContactPage />} />

                      {/* Protected user routes */}
                      <Route element={<ProtectedRoute allowedRoles={['admin', 'roaster', 'user']} />}>
                        <Route path="/profile" element={<ProfilePage />} />
                      </Route>
                    </Route>

                    {/* Standalone Auth Pages */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignUpPage />} />
                    <Route path="/update-password" element={<UpdatePasswordPage />} />

                    {/* Admin Routes */}
                    <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                      <Route path="/admin" element={<AdminLayout />}>
                        <Route index element={<AdminDashboard />} />
                        <Route path="dashboard" element={<AdminDashboard />} />
                        <Route path="analytics/advanced" element={<AdvancedAnalytics />} />
                        <Route path="customers" element={<CustomersManager />} />
                        <Route path="customer/:phone" element={<CustomerDetailsPage />} />
                        <Route path="users" element={<UsersManager />} />
                        <Route path="accounting/summary" element={<FinancialSummary />} />
                        <Route path="accounting/ledger" element={<GeneralLedger />} />
                        <Route path="accounting/sales" element={<SalesReports />} />
                        <Route path="accounting/expenses" element={<ExpensesManager />} />
                        <Route path="accounting/fixed-expenses" element={<FixedExpensesManager />} />
                        <Route path="accounting/purchases" element={<PurchasesLog />} />
                        <Route path="accounting/suppliers" element={<SuppliersManager />} />
                        <Route path="accounting/categories" element={<ExpenseCategoriesManager />} />
                        <Route path="accounting/fixed-costs" element={<FixedCostsManager />} />
                        <Route path="accounting/roastery-payouts" element={<RoasteryPayoutsManager />} />
                        <Route path="accounting/salaries" element={<SalariesManager />} />
                        <Route path="roastery" element={<RoasteryManager />} />
                        <Route path="inventory" element={<InventoryManager />} />
                        <Route path="blends" element={<BlendsManager />} />
                        <Route path="coffee-types" element={<CoffeeTypesManager />} />
                        <Route path="additives" element={<AdditivesManager />} />
                        <Route path="methods" element={<MethodsManager />} />
                        <Route path="discounts" element={<DiscountsManager />} />
                        <Route path="settings" element={<StoreSettings />} />
                        <Route path="loyalty-settings" element={<LoyaltySettings />} />
                        <Route path="notifications" element={<NotificationsManager />} />
                        <Route path="content" element={<ContentManager />} />
                      </Route>
                    </Route>

                    {/* Roaster Route */}
                    <Route element={<ProtectedRoute allowedRoles={['admin', 'roaster']} />}>
                      <Route path="/live/operations" element={<LiveOperationsPage />} />
                    </Route>

                    {/* 404 Page */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Router>
              </ThemeProvider>
            </CartProvider>
          </WishlistProvider>
        </AuthProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
