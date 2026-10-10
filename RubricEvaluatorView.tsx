import React, { useState, useMemo } from 'react';
import {
  Award,
  CheckCircle2,
  AlertCircle,
  FileCode,
  Layers,
  Database,
  Globe,
  HelpCircle,
  Download,
  RotateCcw,
  Sparkles,
  ClipboardCheck,
} from 'lucide-react';

interface RubricCriterion {
  id: string;
  category: string;
  name: string;
  maxMarks: number;
  description: string;
  inspectionPoints: string[];
  codeCheckKeys: string[];
}

const RUBRIC_CRITERIA: RubricCriterion[] = [
  // Parameter 1: Problem Understanding & Solution Design (8 marks)
  {
    id: 'p1_scope',
    category: '1. Problem Understanding & Solution Design (8 Marks)',
    name: 'Problem Statement Scope & Requirement Alignment',
    maxMarks: 2,
    description: 'Demonstrates clear grasp of business requirements and edge cases.',
    inspectionPoints: [
      'Well-defined user journeys and business logic',
      'Realistic problem scope without missing critical workflows',
    ],
    codeCheckKeys: ['model', 'dto', 'service'],
  },
  {
    id: 'p1_mvc',
    category: '1. Problem Understanding & Solution Design (8 Marks)',
    name: 'Architectural Layering (MVC Pattern)',
    maxMarks: 3,
    description: 'Clear segregation between Model, View, and Controller layers.',
    inspectionPoints: [
      'Controllers (Servlets) do not contain raw SQL or HTML generation',
      'Models (POJOs/Entities) encapsulate domain state and validation',
      'Services / DAOs isolate business algorithms and data access',
    ],
    codeCheckKeys: ['controller', 'servlet', 'dao', 'model', 'service'],
  },
  {
    id: 'p1_modularity',
    category: '1. Problem Understanding & Solution Design (8 Marks)',
    name: 'Component Modularity & User Interaction Flow',
    maxMarks: 3,
    description: 'Clean package structure and seamless navigation pathways.',
    inspectionPoints: [
      'Logical package organization: com.app.controller, com.app.dao, com.app.model',
      'Intuitive frontend forms communicating with backend endpoints',
    ],
    codeCheckKeys: ['package', 'jsp', 'html'],
  },

  // Parameter 2: Core Java Concepts (10 marks)
  {
    id: 'p2_oop',
    category: '2. Core Java Concepts (10 Marks)',
    name: 'OOP Pillars Implementation (Encapsulation, Polymorphism, Abstraction)',
    maxMarks: 3,
    description: 'Appropriate application of interfaces, classes, private fields, and getters/setters.',
    inspectionPoints: [
      'DAO/Service interfaces decoupled from implementation classes',
      'Domain classes strictly encapsulate state (private fields + accessors)',
      'Constructors initialized properly without mutable leaks',
    ],
    codeCheckKeys: ['interface', 'implements', 'extends', 'private', 'public'],
  },
  {
    id: 'p2_collections',
    category: '2. Core Java Concepts (10 Marks)',
    name: 'Collections Framework & Generics',
    maxMarks: 2,
    description: 'Effective use of List, Map, Set with strong type parameters.',
    inspectionPoints: [
      'Type-safe generics (e.g. List<User>, Map<String, Object>)',
      'Proper collection selection (ArrayList vs LinkedList, HashMap vs TreeMap)',
    ],
    codeCheckKeys: ['List<', 'Map<', 'Set<', 'ArrayList', 'HashMap'],
  },
  {
    id: 'p2_exceptions',
    category: '2. Core Java Concepts (10 Marks)',
    name: 'Exception Handling & Fault Tolerance',
    maxMarks: 3,
    description: 'Robust try-catch hierarchies without swallowed or empty catch blocks.',
    inspectionPoints: [
      'No empty catch blocks (catch (Exception e) {})',
      'Meaningful logging or user-friendly error redirection',
      'Custom exception classes for business errors (e.g. UserNotFoundException)',
    ],
    codeCheckKeys: ['try', 'catch', 'throw', 'Exception'],
  },
  {
    id: 'p2_cleancode',
    category: '2. Core Java Concepts (10 Marks)',
    name: 'Naming Conventions & Code Readability',
    maxMarks: 2,
    description: 'Standard camelCase, UPPER_CASE constants, and single-responsibility methods.',
    inspectionPoints: [
      'Standard Java naming: classes in PascalCase, methods/variables in camelCase',
      'Concise functions under 30-40 lines; no monolithic code blocks',
    ],
    codeCheckKeys: ['final', 'static'],
  },

  // Parameter 3: Database Integration (JDBC) (8 marks)
  {
    id: 'p3_schema',
    category: '3. Database Integration (JDBC) (8 Marks)',
    name: 'Database Schema Design & Integrity',
    maxMarks: 2,
    description: 'Normalized relational schema with primary/foreign keys and constraints.',
    inspectionPoints: [
      'Primary keys and foreign key constraints specified',
      'Columns have appropriate SQL data types (VARCHAR, INT, TIMESTAMP)',
    ],
    codeCheckKeys: ['CREATE TABLE', 'PRIMARY KEY', 'FOREIGN KEY'],
  },
  {
    id: 'p3_sql_security',
    category: '3. Database Integration (JDBC) (8 Marks)',
    name: 'SQL Injection Prevention (PreparedStatement)',
    maxMarks: 3,
    description: 'Strict usage of PreparedStatement with parameterized placeholders (?).',
    inspectionPoints: [
      'Zero string concatenation in queries (NO "SELECT * FROM users WHERE name = " + input)',
      'Parameterized queries with preparedStatement.setString(1, ...)',
    ],
    codeCheckKeys: ['PreparedStatement', 'prepareStatement', '?'],
  },
  {
    id: 'p3_resource_mgmt',
    category: '3. Database Integration (JDBC) (8 Marks)',
    name: 'Connection & Resource Management (Try-with-Resources)',
    maxMarks: 3,
    description: 'Guaranteed closure of Connection, Statement, and ResultSet to avoid connection leaks.',
    inspectionPoints: [
      'Try-with-resources statement: try (Connection conn = ...; PreparedStatement ps = ...)',
      'Or explicit closing inside finally blocks',
      'Centralized DBConnectionFactory or connection pool utility class',
    ],
    codeCheckKeys: ['getConnection', 'close()', 'AutoCloseable', 'DriverManager'],
  },

  // Parameter 4: Servlets & Web Integration (7 marks)
  {
    id: 'p4_lifecycle',
    category: '4. Servlets & Web Integration (7 Marks)',
    name: 'Servlet Lifecycle & Request Routing (doGet / doPost)',
    maxMarks: 2,
    description: 'Correct HTTP verb segregation and URL mapping (@WebServlet or web.xml).',
    inspectionPoints: [
      'GET used for idempotent read queries; POST used for mutations/logins',
      'Annotation @WebServlet("/endpoint") or web.xml deployment descriptor correctly mapped',
    ],
    codeCheckKeys: ['HttpServlet', 'doGet', 'doPost', '@WebServlet'],
  },
  {
    id: 'p4_session',
    category: '4. Servlets & Web Integration (7 Marks)',
    name: 'Session & State Management (HttpSession / Cookies)',
    maxMarks: 2,
    description: 'Secure session handling for user authentication and state persistence.',
    inspectionPoints: [
      'request.getSession() with session.setAttribute() and session.getAttribute()',
      'Session invalidation on logout: session.invalidate()',
    ],
    codeCheckKeys: ['HttpSession', 'getSession', 'setAttribute', 'getAttribute'],
  },
  {
    id: 'p4_dispatch',
    category: '4. Servlets & Web Integration (7 Marks)',
    name: 'Inter-Component Dispatching (forward vs sendRedirect)',
    maxMarks: 2,
    description: 'Appropriate choice between RequestDispatcher.forward() and response.sendRedirect().',
    inspectionPoints: [
      'forward() used to render internal JSPs with request scope attributes',
      'sendRedirect() used after POST (Post-Redirect-Get pattern) to avoid duplicate submissions',
    ],
    codeCheckKeys: ['RequestDispatcher', 'forward', 'sendRedirect'],
  },
  {
    id: 'p4_validation',
    category: '4. Servlets & Web Integration (7 Marks)',
    name: 'Input Validation & Response Encoding',
    maxMarks: 1,
    description: 'Sanitizing request parameters and setting appropriate content type/character encoding.',
    inspectionPoints: [
      'request.setCharacterEncoding("UTF-8") and response.setContentType("text/html")',
      'Null and empty checks on request.getParameter()',
    ],
    codeCheckKeys: ['getParameter', 'setContentType', 'setCharacterEncoding'],
  },
];

export const RubricEvaluatorView: React.FC = () => {
  const [studentName, setStudentName] = useState('Aniket Rao');
  const [projectTitle, setProjectTitle] = useState('Online Banking & Loan Approval Portal');
  const [evaluatorNotes, setEvaluatorNotes] = useState('');
  const [sampleCode, setSampleCode] = useState(`// Sample Java Servlet & DAO snippet for inspection
package com.banking.controller;

import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

@WebServlet("/account")
public class AccountServlet extends HttpServlet {
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        request.setCharacterEncoding("UTF-8");
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("userId") == null) {
            response.sendRedirect("login.jsp");
            return;
        }

        String action = request.getParameter("action");
        try {
            if ("deposit".equals(action)) {
                double amount = Double.parseDouble(request.getParameter("amount"));
                processDeposit((Integer) session.getAttribute("userId"), amount);
                response.sendRedirect("dashboard.jsp?status=success");
            }
        } catch (NumberFormatException e) {
            request.setAttribute("error", "Invalid numeric amount entered.");
            request.getRequestDispatcher("deposit.jsp").forward(request, response);
        } catch (SQLException e) {
            request.setAttribute("error", "Database error occurred.");
            request.getRequestDispatcher("error.jsp").forward(request, response);
        }
    }

    private void processDeposit(int userId, double amount) throws SQLException {
        String sql = "UPDATE accounts SET balance = balance + ? WHERE user_id = ?";
        try (Connection conn = DBConnectionFactory.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setDouble(1, amount);
            ps.setInt(2, userId);
            ps.executeUpdate();
        }
    }
}`);

  // Scores record: criterionId -> awarded marks
  const [scores, setScores] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    RUBRIC_CRITERIA.forEach(c => {
      // Default initial score: near full for demonstration
      initial[c.id] = c.maxMarks;
    });
    return initial;
  });

  const handleScoreChange = (id: string, value: number, max: number) => {
    const clamped = Math.max(0, Math.min(max, value));
    setScores(prev => ({ ...prev, [id]: clamped }));
  };

  // Group criteria by categories
  const categoriesMap = useMemo(() => {
    const map = new Map<string, RubricCriterion[]>();
    RUBRIC_CRITERIA.forEach(c => {
      if (!map.has(c.category)) {
        map.set(c.category, []);
      }
      map.get(c.category)!.push(c);
    });
    return map;
  }, []);

  // Category totals
  const categoryScores = useMemo(() => {
    const result: Record<string, { current: number; max: number }> = {};
    Array.from(categoriesMap.entries()).forEach(([cat, list]) => {
      let cur = 0;
      let m = 0;
      list.forEach(item => {
        cur += scores[item.id] || 0;
        m += item.maxMarks;
      });
      result[cat] = { current: cur, max: m };
    });
    return result;
  }, [categoriesMap, scores]);

  const totalCurrentScore = useMemo(() => {
    return Object.values(scores).reduce((a, b) => a + b, 0);
  }, [scores]);

  const totalMaxScore = 33; // 8 + 10 + 8 + 7

  const percentage = ((totalCurrentScore / totalMaxScore) * 100).toFixed(1);

  // Automated heuristic code scanner
  const codeAnalysis = useMemo(() => {
    const checks = [
      {
        label: 'PreparedStatement (SQL Injection guard)',
        found: sampleCode.includes('PreparedStatement') && sampleCode.includes('?'),
        icon: Database,
      },
      {
        label: 'Try-with-Resources (Connection leak guard)',
        found: sampleCode.includes('try (') && sampleCode.includes('Connection'),
        icon: Layers,
      },
      {
        label: 'Servlet Lifecycle (doGet / doPost)',
        found: sampleCode.includes('HttpServlet') && (sampleCode.includes('doGet') || sampleCode.includes('doPost')),
        icon: Globe,
      },
      {
        label: 'Session Management (HttpSession)',
        found: sampleCode.includes('HttpSession') && sampleCode.includes('getSession'),
        icon: CheckCircle2,
      },
      {
        label: 'Request Dispatcher & Redirect',
        found: sampleCode.includes('forward') || sampleCode.includes('sendRedirect'),
        icon: FileCode,
      },
    ];
    return checks;
  }, [sampleCode]);

  const handleExportEvaluation = () => {
    const report = `===============================================================
JAVA WEB BASED PROJECTS EVALUATION REPORT (33 MARKS)
===============================================================
Student Name    : ${studentName}
Project Title   : ${projectTitle}
Evaluation Date : ${new Date().toLocaleDateString('en-IN')}
Total Score     : ${totalCurrentScore} / ${totalMaxScore} (${percentage}%)
Performance     : ${Number(percentage) >= 80 ? 'Distinction' : Number(percentage) >= 60 ? 'First Class' : 'Pass'}

---------------------------------------------------------------
CATEGORY-WISE SCORE BREAKDOWN:
---------------------------------------------------------------
1. Problem Understanding & Solution Design: ${categoryScores['1. Problem Understanding & Solution Design (8 Marks)']?.current || 0} / 8 Marks
2. Core Java Concepts                      : ${categoryScores['2. Core Java Concepts (10 Marks)']?.current || 0} / 10 Marks
3. Database Integration (JDBC)             : ${categoryScores['3. Database Integration (JDBC) (8 Marks)']?.current || 0} / 8 Marks
4. Servlets & Web Integration              : ${categoryScores['4. Servlets & Web Integration (7 Marks)']?.current || 0} / 7 Marks

---------------------------------------------------------------
DETAILED CRITERIA MATRIX:
---------------------------------------------------------------
${RUBRIC_CRITERIA.map(
  c => `[${scores[c.id] || 0}/${c.maxMarks}] ${c.name}\n  - ${c.description}`
).join('\n\n')}

---------------------------------------------------------------
EVALUATOR REMARKS / RECOMMENDATIONS:
---------------------------------------------------------------
${evaluatorNotes || 'All foundational Java EE architecture standards and security parameters satisfied.'}
===============================================================`;

    const blob = new Blob([report], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Java_Rubric_Evaluation_${studentName.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 text-white shadow-md shadow-orange-500/20">
              <Award className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Java Web Projects Marking Rubric
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Standardized evaluation parameters & interactive code audit for 33 marks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportEvaluation}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.01]"
          >
            <Download className="w-4 h-4" />
            <span>Export Scorecard</span>
          </button>
        </div>
      </div>

      {/* Top 4 Rubric Parameter Cards Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from(categoriesMap.entries()).map(([cat, list], idx) => {
          const stats = categoryScores[cat] || { current: 0, max: 0 };
          const catPercent = ((stats.current / stats.max) * 100).toFixed(0);
          const iconColors = [
            'from-blue-600 to-indigo-600 text-blue-100',
            'from-emerald-600 to-teal-600 text-emerald-100',
            'from-amber-600 to-orange-600 text-amber-100',
            'from-purple-600 to-fuchsia-600 text-purple-100',
          ][idx % 4];

          return (
            <div
              key={cat}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between"
            >
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Parameter {idx + 1}
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1 leading-snug">
                  {cat.split('(')[0].trim()}
                </h3>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-end justify-between">
                <div>
                  <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                    {stats.current}
                  </span>
                  <span className="text-xs text-slate-400"> / {stats.max} Marks</span>
                </div>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    Number(catPercent) >= 80
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                      : Number(catPercent) >= 50
                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                      : 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                  }`}
                >
                  {catPercent}%
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Score & Candidate Bar */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full md:w-auto flex-1">
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              Candidate / Student Name
            </label>
            <input
              type="text"
              value={studentName}
              onChange={e => setStudentName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-800/90 border border-slate-700 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              Project Title
            </label>
            <input
              type="text"
              value={projectTitle}
              onChange={e => setProjectTitle(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-800/90 border border-slate-700 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-6 shrink-0 bg-slate-800/60 p-4 rounded-2xl border border-slate-700">
          <div className="text-right">
            <span className="text-[11px] uppercase tracking-wider text-emerald-400 font-bold block">
              Aggregate Total
            </span>
            <div className="text-3xl font-extrabold text-white">
              {totalCurrentScore}{' '}
              <span className="text-sm font-normal text-slate-400">/ {totalMaxScore}</span>
            </div>
          </div>
          <div className="h-10 w-px bg-slate-700" />
          <div className="text-center">
            <span className="text-[11px] uppercase tracking-wider text-emerald-400 font-bold block">
              Percentage
            </span>
            <div className="text-3xl font-extrabold text-emerald-400">{percentage}%</div>
          </div>
        </div>
      </div>

      {/* Code Inspector & Live Heuristic Scanner */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCode className="w-5 h-5 text-indigo-500" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Codebase Inspection & Heuristic Pattern Validator
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            Paste any Servlet / DAO / Model snippet to test rubric patterns
          </span>
        </div>

        {/* Live Detected Patterns */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {codeAnalysis.map(chk => (
            <span
              key={chk.label}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border ${
                chk.found
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                  : 'bg-slate-50 text-slate-400 border-slate-200 dark:bg-slate-800/40 dark:border-slate-800'
              }`}
            >
              <chk.icon className="w-3.5 h-3.5" />
              <span>{chk.label}:</span>
              <strong className={chk.found ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-400'}>
                {chk.found ? 'Detected ✓' : 'Missing'}
              </strong>
            </span>
          ))}
        </div>

        <textarea
          rows={7}
          value={sampleCode}
          onChange={e => setSampleCode(e.target.value)}
          className="w-full font-mono text-xs p-3.5 rounded-2xl bg-slate-950 text-emerald-400 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          placeholder="Paste Java classes, Servlets, or JDBC queries here..."
        />
      </div>

      {/* Interactive Rubric Parameters & Sub-Criteria Evaluator */}
      <div className="space-y-6">
        {Array.from(categoriesMap.entries()).map(([categoryTitle, criteriaList]) => (
          <div
            key={categoryTitle}
            className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                {categoryTitle}
              </h2>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                Awarded: {categoryScores[categoryTitle]?.current || 0} /{' '}
                {categoryScores[categoryTitle]?.max || 0}
              </span>
            </div>

            <div className="space-y-4">
              {criteriaList.map(criterion => {
                const currentVal = scores[criterion.id] ?? criterion.maxMarks;
                return (
                  <div
                    key={criterion.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 flex flex-col md:flex-row md:items-start justify-between gap-4"
                  >
                    <div className="flex-1 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          {criterion.name}
                        </span>
                        <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-full">
                          Max: {criterion.maxMarks} Marks
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300">
                        {criterion.description}
                      </p>

                      <div className="pt-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                          Key Evaluation Inspection Points:
                        </span>
                        <ul className="list-disc list-inside text-[11px] text-slate-500 space-y-0.5">
                          {criterion.inspectionPoints.map((pt, i) => (
                            <li key={i}>{pt}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Marks Stepper / Input */}
                    <div className="flex items-center gap-3 shrink-0 self-end md:self-center bg-white dark:bg-slate-900 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
                      <button
                        type="button"
                        onClick={() =>
                          handleScoreChange(criterion.id, currentVal - 1, criterion.maxMarks)
                        }
                        className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold hover:bg-slate-200 transition-colors"
                      >
                        -
                      </button>
                      <div className="text-center min-w-[3rem]">
                        <span className="text-lg font-extrabold text-slate-900 dark:text-white">
                          {currentVal}
                        </span>
                        <span className="text-xs text-slate-400 block">/{criterion.maxMarks}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          handleScoreChange(criterion.id, currentVal + 1, criterion.maxMarks)
                        }
                        className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold hover:bg-slate-200 transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Evaluator Notes Section */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Evaluator General Feedback & Remarks
        </h3>
        <textarea
          rows={3}
          value={evaluatorNotes}
          onChange={e => setEvaluatorNotes(e.target.value)}
          placeholder="Enter remarks on student coding discipline, schema normalization, or suggestions for improvement..."
          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>
    </div>
  );
};
