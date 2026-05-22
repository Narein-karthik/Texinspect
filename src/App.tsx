import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';

import { Layout } from './components/Layout';

import { Dashboard } from './views/Dashboard';
import { CreateInspection } from './views/CreateInspection';
import { InspectionDetail } from './views/InspectionDetail';
import { ReportView } from './views/ReportView';
import ProfileView from './views/ProfileView';
import { ReportsView } from './views/ReportsView';

import { AnimatePresence, motion } from 'motion/react';

function AppRoutes() {

  const location = useLocation();

  return (

    <AnimatePresence mode="wait">

      <Routes location={location}>

        {/* DASHBOARD */}
        <Route
          path="/"
          element={
            <motion.div
              key="dash"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              <Dashboard />
            </motion.div>
          }
        />

        {/* NEW INSPECTION */}
        <Route
          path="/new"
          element={
            <motion.div
              key="new"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              <CreateInspection />
            </motion.div>
          }
        />

        {/* PROFILE */}
        <Route
          path="/profile"
          element={<ProfileView />}
        />

        {/* REPORTS LIST */}
        <Route
          path="/reports"
          element={
            <motion.div
              key="reports"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              <ReportsView />
            </motion.div>
          }
        />

        {/* INSPECTION DETAIL */}
        <Route
          path="/inspection/:id"
          element={
            <motion.div
              key="detail"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              <InspectionDetail />
            </motion.div>
          }
        />

        {/* SINGLE REPORT */}
        <Route
          path="/reports/:id"
          element={
            <motion.div
              key="report"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              <ReportView />
            </motion.div>
          }
        />

      </Routes>

    </AnimatePresence>
  );
}

export default function App() {

  return (
    <BrowserRouter>

      <Layout>
        <AppRoutes />
      </Layout>

    </BrowserRouter>
  );
}