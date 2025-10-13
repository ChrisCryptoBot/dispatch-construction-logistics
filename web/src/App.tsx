import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './contexts/AuthContext-fixed'
import { ThemeProvider } from './contexts/ThemeContext'
import ProtectedRoute from './components/shared/ProtectedRoute'
import S1Layout from './components/S1LayoutConstruction'
import CustomerLayout from './components/CustomerLayout'
import ErrorBoundary from './components/shared/ErrorBoundary'

// Pages
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
// Carrier Pages
import CarrierDashboard from './pages/carrier/CarrierDashboard'
import CarrierLoadBoardPage from './pages/CarrierLoadBoardPage'
import CarrierFleetManagementPage from './pages/carrier/CarrierFleetManagementPage'
import CarrierCalendarPage from './pages/carrier/CarrierCalendarPage'
import CarrierDocumentsPage from './pages/carrier/CarrierDocumentsPage'
import CarrierCompliancePage from './pages/carrier/CarrierCompliancePage'
import CarrierZoneManagementPage from './pages/carrier/CarrierZoneManagementPage'
import EquipmentMonitorPage from './pages/carrier/EquipmentMonitorPage'
import DataVisualizationPage from './pages/carrier/DataVisualizationPage'
import CarrierInvoicesPage from './pages/carrier/CarrierInvoicesPage'
import CarrierMyLoadsPage from './pages/carrier/CarrierMyLoadsPage'
import DriverManagementPage from './pages/carrier/DriverManagementPage'
import LoadAssignmentPage from './pages/carrier/LoadAssignmentPage'
import PayoutSetupPage from './pages/carrier/PayoutSetupPage'

// Customer Pages
import CustomerDashboard from './pages/customer/CustomerDashboard'
import CustomerCalendarPage from './pages/customer/CustomerCalendarPage'
import CustomerDocumentsPage from './pages/customer/CustomerDocumentsPage'
import CustomerInvoicesPage from './pages/customer/CustomerInvoicesPage'
import CustomerMyLoadsPage from './pages/customer/CustomerMyLoadsPage'
import LoadPostingWizard from './pages/customer/LoadPostingWizard'
import JobSitesPage from './pages/customer/JobSitesPage'
import SchedulePage from './pages/customer/SchedulePage'
import TruckBoardPage from './pages/customer/TruckBoardPage'
import PaymentSetupPage from './pages/customer/PaymentSetupPage'

// Shared/Other Pages
import ShipperDashboard from './pages/ShipperDashboard'
import LoadDetailsPage from './pages/LoadDetailsPage'
import LoadCreatePage from './pages/LoadCreatePage'
import ProfilePage from './pages/ProfilePage'
import ScaleTicketsPage from './pages/ScaleTicketsPage'
import FactoringPage from './pages/FactoringPage'
import MessagingPage from './pages/MessagingPage'
import SettingsPage from './pages/SettingsPage'
import BOLTemplatesPage from './pages/BOLTemplatesPage'
import SplashPage from './pages/SplashPage'
import UIShowcasePage from './pages/UIShowcasePage'
import CarrierOnboardingPage from './pages/onboarding/CarrierOnboardingPage'
import CustomerOnboardingPage from './pages/onboarding/CustomerOnboardingPage'
// Priority 1 Load Management Pages
import DraftLoadsPage from './pages/DraftLoadsPage'
import CarrierAcceptancePage from './pages/CarrierAcceptancePage'
import DriverAcceptancePage from './pages/DriverAcceptancePage'
// Priority 2 Load Management Pages
import LoadTrackingPage from './pages/LoadTrackingPage'
import DisputeResolutionPage from './pages/DisputeResolutionPage'
// Auth Pages
import EmailVerificationPage from './pages/EmailVerificationPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
})

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <Router>
            <Routes>
            <Route path="/auth/login" element={<LoginPage />} />
            <Route path="/login" element={<SplashPage />} />
            <Route path="/auth/register" element={<RegisterPage />} />
            <Route path="/register" element={<SplashPage />} />
            <Route path="/splash" element={<SplashPage />} />
            <Route path="/verify-email" element={<EmailVerificationPage />} />
            <Route path="/onboarding/carrier" element={<CarrierOnboardingPage />} />
            <Route path="/onboarding/customer" element={<CustomerOnboardingPage />} />
            <Route path="/ui-showcase" element={<UIShowcasePage />} />
            <Route path="/test-load-assignment" element={
              <S1Layout>
                <LoadAssignmentPage />
              </S1Layout>
            } />
            <Route path="/" element={<SplashPage />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <S1Layout>
                  <CarrierDashboard />
                </S1Layout>
              </ProtectedRoute>
            } />
            <Route path="/carrier-dashboard" element={
              <ProtectedRoute>
                <S1Layout>
                  <CarrierDashboard />
                </S1Layout>
              </ProtectedRoute>
            } />
            <Route path="/shipper-dashboard" element={
              <ProtectedRoute>
                <S1Layout>
                  <ShipperDashboard />
                </S1Layout>
              </ProtectedRoute>
            } />
            <Route path="/loads" element={
              <ProtectedRoute>
                <S1Layout>
                  <CarrierLoadBoardPage />
                </S1Layout>
              </ProtectedRoute>
            } />
            <Route path="/loads/new" element={
              <ProtectedRoute>
                <S1Layout>
                  <LoadCreatePage />
                </S1Layout>
              </ProtectedRoute>
            } />
            <Route path="/loads/:id" element={
              <ProtectedRoute>
                <S1Layout>
                  <LoadDetailsPage />
                </S1Layout>
              </ProtectedRoute>
            } />
            <Route path="/marketplace" element={
              <ProtectedRoute>
                <S1Layout>
                  <CarrierLoadBoardPage />
                </S1Layout>
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <S1Layout>
                  <ProfilePage />
                </S1Layout>
              </ProtectedRoute>
            } />
            <Route path="/scale-tickets" element={
              <ProtectedRoute>
                <S1Layout>
                  <ScaleTicketsPage />
                </S1Layout>
              </ProtectedRoute>
            } />
            <Route path="/factoring" element={
              <ProtectedRoute>
                <S1Layout>
                  <FactoringPage />
                </S1Layout>
              </ProtectedRoute>
            } />
            <Route path="/invoices" element={
              <ProtectedRoute>
                <S1Layout>
                  <CarrierInvoicesPage />
                </S1Layout>
              </ProtectedRoute>
            } />
            <Route path="/carrier/payout-setup" element={
              <ProtectedRoute>
                <S1Layout>
                  <PayoutSetupPage />
                </S1Layout>
              </ProtectedRoute>
            } />
            <Route path="/messaging" element={
              <ProtectedRoute>
                <S1Layout>
                  <MessagingPage />
                </S1Layout>
              </ProtectedRoute>
            } />
            {/* Redirect old analytics route to dashboard */}
            <Route path="/analytics" element={
              <ProtectedRoute>
                <S1Layout>
                  <CarrierDashboard />
                </S1Layout>
              </ProtectedRoute>
            } />
            <Route path="/calendar" element={
              <ProtectedRoute>
                <S1Layout>
                  <CarrierCalendarPage />
                </S1Layout>
              </ProtectedRoute>
            } />
            <Route path="/fleet" element={
              <ProtectedRoute>
                <S1Layout>
                  <CarrierFleetManagementPage />
                </S1Layout>
              </ProtectedRoute>
            } />
            <Route path="/my-loads" element={
              <ProtectedRoute>
                <S1Layout>
                  <CarrierMyLoadsPage />
                </S1Layout>
              </ProtectedRoute>
            } />
            <Route path="/load-assignment" element={
              <ProtectedRoute>
                <S1Layout>
                  <LoadAssignmentPage />
                </S1Layout>
              </ProtectedRoute>
            } />
            <Route path="/dispatch" element={
              <ProtectedRoute>
                <S1Layout>
                  <LoadAssignmentPage />
                </S1Layout>
              </ProtectedRoute>
            } />
            <Route path="/drivers" element={
              <ProtectedRoute>
                <S1Layout>
                  <DriverManagementPage />
                </S1Layout>
              </ProtectedRoute>
            } />
            <Route path="/zones" element={
              <ProtectedRoute>
                <S1Layout>
                  <CarrierZoneManagementPage />
                </S1Layout>
              </ProtectedRoute>
            } />
            <Route path="/bol-templates" element={
              <ProtectedRoute>
                <S1Layout>
                  <BOLTemplatesPage />
                </S1Layout>
              </ProtectedRoute>
            } />
            <Route path="/equipment" element={
              <ProtectedRoute>
                <S1Layout>
                  <EquipmentMonitorPage />
                </S1Layout>
              </ProtectedRoute>
            } />
            <Route path="/data-viz" element={
              <ProtectedRoute>
                <S1Layout>
                  <DataVisualizationPage />
                </S1Layout>
              </ProtectedRoute>
            } />
            <Route path="/documents" element={
              <ProtectedRoute>
                <S1Layout>
                  <CarrierDocumentsPage />
                </S1Layout>
              </ProtectedRoute>
            } />
            <Route path="/compliance" element={
              <ProtectedRoute>
                <S1Layout>
                  <CarrierCompliancePage />
                </S1Layout>
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <S1Layout>
                  <SettingsPage />
                </S1Layout>
              </ProtectedRoute>
            } />
            <Route path="/routes" element={
              <ProtectedRoute>
                <S1Layout>
                  <div style={{padding: '40px', color: '#fff'}}>
                    <h2>Route Planning</h2>
                    <p>Route optimization and planning features coming soon...</p>
                  </div>
                </S1Layout>
              </ProtectedRoute>
            } />
            
            {/* Customer Portal Routes - Uses CustomerLayout */}
            <Route path="/customer-dashboard" element={
              <ProtectedRoute>
                <CustomerLayout>
                  <CustomerDashboard />
                </CustomerLayout>
              </ProtectedRoute>
            } />
            <Route path="/customer/post-load" element={
              <ProtectedRoute>
                <CustomerLayout>
                  <LoadPostingWizard />
                </CustomerLayout>
              </ProtectedRoute>
            } />
            <Route path="/customer/loads" element={
              <ProtectedRoute>
                <CustomerLayout>
                  <CustomerMyLoadsPage />
                </CustomerLayout>
              </ProtectedRoute>
            } />
            <Route path="/customer/carriers" element={
              <ProtectedRoute>
                <CustomerLayout>
                  <CustomerDashboard />
                </CustomerLayout>
              </ProtectedRoute>
            } />
            {/* Redirect old analytics route to dashboard */}
            <Route path="/customer/analytics" element={
              <ProtectedRoute>
                <CustomerLayout>
                  <CustomerDashboard />
                </CustomerLayout>
              </ProtectedRoute>
            } />
            <Route path="/customer/messages" element={
              <ProtectedRoute>
                <CustomerLayout>
                  <MessagingPage />
                </CustomerLayout>
              </ProtectedRoute>
            } />
            <Route path="/customer/job-sites" element={
              <ProtectedRoute>
                <CustomerLayout>
                  <JobSitesPage />
                </CustomerLayout>
              </ProtectedRoute>
            } />
            <Route path="/customer/schedule" element={
              <ProtectedRoute>
                <CustomerLayout>
                  <SchedulePage />
                </CustomerLayout>
              </ProtectedRoute>
            } />
            <Route path="/customer/calendar" element={
              <ProtectedRoute>
                <CustomerLayout>
                  <CustomerCalendarPage />
                </CustomerLayout>
              </ProtectedRoute>
            } />
            <Route path="/customer/documents" element={
              <ProtectedRoute>
                <CustomerLayout>
                  <CustomerDocumentsPage />
                </CustomerLayout>
              </ProtectedRoute>
            } />
            <Route path="/customer/invoices" element={
              <ProtectedRoute>
                <CustomerLayout>
                  <CustomerInvoicesPage />
                </CustomerLayout>
              </ProtectedRoute>
            } />
            <Route path="/customer/payment-setup" element={
              <ProtectedRoute>
                <CustomerLayout>
                  <PaymentSetupPage />
                </CustomerLayout>
              </ProtectedRoute>
            } />
            <Route path="/customer/truck-board" element={
              <ProtectedRoute>
                <CustomerLayout>
                  <TruckBoardPage />
                </CustomerLayout>
              </ProtectedRoute>
            } />
            
            {/* Priority 1 Load Management Routes */}
            <Route path="/draft-loads" element={
              <ProtectedRoute>
                <CustomerLayout>
                  <DraftLoadsPage />
                </CustomerLayout>
              </ProtectedRoute>
            } />
            <Route path="/loads/:id/acceptance" element={
              <ProtectedRoute>
                <S1Layout>
                  <CarrierAcceptancePage />
                </S1Layout>
              </ProtectedRoute>
            } />
            <Route path="/accept-load/:workflowId" element={<DriverAcceptancePage />} />
            
            {/* Priority 2 Load Management Routes */}
            <Route path="/loads/:id/tracking" element={
              <ProtectedRoute>
                <S1Layout>
                  <LoadTrackingPage />
                </S1Layout>
              </ProtectedRoute>
            } />
            <Route path="/disputes" element={
              <ProtectedRoute>
                <S1Layout>
                  <DisputeResolutionPage />
                </S1Layout>
              </ProtectedRoute>
            } />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
    </QueryClientProvider>
    </ErrorBoundary>
  )
}

export default App
