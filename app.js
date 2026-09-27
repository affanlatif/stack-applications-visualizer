/**
 * Applications of Stack — Interactive Educational Visualizer
 * BTech CSE / Data Structures & Algorithms Presentation Engine
 */

document.addEventListener('DOMContentLoaded', () => {

  // ==========================================
  // NAVIGATION & PROGRESS BAR TRACKING
  // ==========================================
  const progressBar = document.getElementById('progress-bar');
  const navLinks = [
    { link: document.getElementById('nav-lifo'), section: document.getElementById('section-lifo') },
    { link: document.getElementById('nav-infix'), section: document.getElementById('section-infix') },
    { link: document.getElementById('nav-postfix'), section: document.getElementById('section-postfix') },
    { link: document.getElementById('nav-pipeline'), section: document.getElementById('section-pipeline') }
  ];

  window.addEventListener('scroll', () => {
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    if (progressBar) progressBar.style.width = scrolled + '%';

    // Active nav link highlight
    let currentSection = navLinks[0].link;
    navLinks.forEach(item => {
      if (item.section) {
        const top = item.section.offsetTop - 120;
        if (winScroll >= top) {
          currentSection = item.link;
        }
      }
    });

    navLinks.forEach(item => {
      if (item.link) item.link.classList.remove('active');
    });
    if (currentSection) currentSection.classList.add('active');
  });

  // ==========================================
  // SECTION 1: STACK FUNDAMENTALS (LIFO)
  // ==========================================
  const MAX_CAPACITY = 8;
  let lifoStack = [];

  const stackFrame = document.getElementById('stack-frame');
  const topPointer = document.getElementById('top-pointer');
  const statusMsg = document.getElementById('stack-status-msg');
  const stackInput = document.getElementById('stack-input');

  const btnPush = document.getElementById('btn-push');
  const btnPop = document.getElementById('btn-pop');
  const btnPeek = document.getElementById('btn-peek');
  const btnClear = document.getElementById('btn-clear');

  function highlightLifoCode(lineIds) {
    document.querySelectorAll('#lifo-code-block .code-line').forEach(el => el.classList.remove('active'));
    lineIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.add('active');
    });
  }

  function renderLifoStack(peekHighlight = false) {
    if (!stackFrame) return;

    // Remove existing elements except top-pointer
    const existingElements = stackFrame.querySelectorAll('.stack-element');
    existingElements.forEach(el => el.remove());

    lifoStack.forEach((val, idx) => {
      const el = document.createElement('div');
      el.className = 'stack-element';
      if (idx === lifoStack.length - 1) {
        el.classList.add('top-item');
        if (peekHighlight) el.classList.add('peek-highlight');
      }

      el.innerHTML = `
        <span>${val}</span>
        <span class="stack-element-idx">stack[${idx}]</span>
      `;
      stackFrame.appendChild(el);
    });

    // Position TOP Pointer
    const topIdx = lifoStack.length - 1;
    if (topIdx >= 0) {
      topPointer.style.display = 'flex';
      topPointer.style.bottom = `${topIdx * 48 + 12}px`;
    } else {
      topPointer.style.display = 'none';
    }
  }

  function handlePush(value) {
    const val = value || (stackInput ? stackInput.value.trim() : '');
    if (!val) {
      setStatusMsg('Please enter an element to PUSH', 'error');
      return;
    }

    if (lifoStack.length >= MAX_CAPACITY) {
      setStatusMsg('STACK OVERFLOW: Cannot PUSH — stack is full (MAX = 8)', 'error');
      highlightLifoCode(['line-push-2']);
      return;
    }

    lifoStack.push(val);
    if (stackInput) stackInput.value = '';
    renderLifoStack();
    setStatusMsg(`PUSH(${val}): ${val} added to TOP (top = ${lifoStack.length - 1})`, 'info');
    highlightLifoCode(['line-push-1', 'line-push-3']);
  }

  function handlePop() {
    if (lifoStack.length === 0) {
      setStatusMsg('STACK UNDERFLOW: Cannot POP — stack is empty', 'error');
      highlightLifoCode(['line-pop-2']);
      return;
    }

    const poppedVal = lifoStack.pop();
    renderLifoStack();
    setStatusMsg(`POP(): ${poppedVal} removed from TOP (top = ${lifoStack.length - 1})`, 'success');
    highlightLifoCode(['line-pop-1', 'line-pop-3']);
  }

  function handlePeek() {
    if (lifoStack.length === 0) {
      setStatusMsg('STACK UNDERFLOW: Cannot PEEK — stack is empty', 'error');
      highlightLifoCode(['line-peek-2']);
      return;
    }

    const topVal = lifoStack[lifoStack.length - 1];
    renderLifoStack(true);
    setStatusMsg(`PEEK(): Top element = ${topVal} (Stack unchanged)`, 'info');
    highlightLifoCode(['line-peek-1', 'line-peek-2']);

    setTimeout(() => renderLifoStack(false), 1200);
  }

  function handleClear() {
    lifoStack = [];
    renderLifoStack();
    setStatusMsg('Stack Cleared: top = -1', 'info');
    highlightLifoCode([]);
  }

  function setStatusMsg(msg, type = 'info') {
    if (!statusMsg) return;
    statusMsg.textContent = msg;
    statusMsg.className = `status-badge ${type}`;
  }

  // Window global quick push
  window.quickPush = (val) => handlePush(val);

  if (btnPush) btnPush.addEventListener('click', () => handlePush());
  if (btnPop) btnPop.addEventListener('click', handlePop);
  if (btnPeek) btnPeek.addEventListener('click', handlePeek);
  if (btnClear) btnClear.addEventListener('click', handleClear);
  if (stackInput) {
    stackInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handlePush();
    });
  }

  renderLifoStack();

  // ==========================================
  // SECTION 2: INFIX → POSTFIX CONVERSION
  // ==========================================
  let infixSteps = [];
  let currentInfixStep = 0;
  let infixAutoTimer = null;

  const infixInput = document.getElementById('infix-input');
  const btnInfixLoad = document.getElementById('btn-infix-load');
  const btnInfixNext = document.getElementById('btn-infix-next');
  const btnInfixPrev = document.getElementById('btn-infix-prev');
  const btnInfixAuto = document.getElementById('btn-infix-autoplay');
  const btnInfixReset = document.getElementById('btn-infix-reset');
  const infixSpeedSlider = document.getElementById('infix-speed');
  const infixSpeedVal = document.getElementById('infix-speed-val');

  const infixTokensContainer = document.getElementById('infix-tokens-container');
  const opStackFrame = document.getElementById('op-stack-frame');
  const infixOutputBox = document.getElementById('infix-output-box');

  const infixStepTitle = document.getElementById('infix-step-title');
  const infixStepDesc = document.getElementById('infix-step-desc');
  const infixCurrentTokenInfo = document.getElementById('infix-current-token-info');

  const tfInfixVal = document.getElementById('tf-infix-val');
  const tfPostfixVal = document.getElementById('tf-postfix-val');

  function getPrecedence(op) {
    switch (op) {
      case '^': return 3;
      case '*': case '/': case '%': return 2;
      case '+': case '-': return 1;
      default: return 0;
    }
  }

  function isOperand(ch) {
    return /[a-zA-Z0-9]/.test(ch);
  }

  function generateInfixSteps(expression) {
    const steps = [];
    const tokens = expression.replace(/\s+/g, '').split('');
    const stack = [];
    let output = '';

    // Step 0: Initial
    steps.push({
      tokenIdx: -1,
      token: '',
      stack: [],
      output: '',
      title: 'Initial State',
      desc: 'Infix expression loaded. Click Next Step to process tokens left to right.',
      codeLine: 'inf-c-1',
      precLevel: 0
    });

    for (let i = 0; i < tokens.length; i++) {
      const c = tokens[i];

      if (isOperand(c)) {
        output += c;
        steps.push({
          tokenIdx: i,
          token: c,
          stack: [...stack],
          output: output,
          title: `Token '${c}': Operand`,
          desc: `<strong>'${c}'</strong> is an operand. Append directly to Postfix Output.`,
          codeLine: 'inf-c-4',
          precLevel: 0
        });
      } else if (c === '(') {
        stack.push(c);
        steps.push({
          tokenIdx: i,
          token: c,
          stack: [...stack],
          output: output,
          title: `Token '(': Left Parenthesis`,
          desc: `<strong>'('</strong> opens a sub-expression scope. Push onto Operator Stack.`,
          codeLine: 'inf-c-6',
          precLevel: 4
        });
      } else if (c === ')') {
        steps.push({
          tokenIdx: i,
          token: c,
          stack: [...stack],
          output: output,
          title: `Token ')': Right Parenthesis`,
          desc: `<strong>')'</strong> closes scope. Pop operators from stack to output until matching '(' is reached.`,
          codeLine: 'inf-c-8',
          precLevel: 4
        });

        while (stack.length > 0 && stack[stack.length - 1] !== '(') {
          const popped = stack.pop();
          output += popped;
          steps.push({
            tokenIdx: i,
            token: c,
            stack: [...stack],
            output: output,
            title: `Flush Operator '${popped}'`,
            desc: `Popped <strong>'${popped}'</strong> from stack to output buffer.`,
            codeLine: 'inf-c-9',
            precLevel: 0
          });
        }
        if (stack.length > 0 && stack[stack.length - 1] === '(') {
          stack.pop(); // discard '('
          steps.push({
            tokenIdx: i,
            token: c,
            stack: [...stack],
            output: output,
            title: `Discard '('`,
            desc: `Matched and discarded <strong>'('</strong> from stack. Parentheses do not appear in postfix.`,
            codeLine: 'inf-c-10',
            precLevel: 0
          });
        }
      } else { // Operator
        const pCurrent = getPrecedence(c);
        let precRowId = pCurrent === 3 ? 3 : pCurrent === 2 ? 2 : 1;

        steps.push({
          tokenIdx: i,
          token: c,
          stack: [...stack],
          output: output,
          title: `Token '${c}': Operator`,
          desc: `Encountered operator <strong>'${c}'</strong> (Precedence level ${pCurrent}). Checking stack top...`,
          codeLine: 'inf-c-12',
          precLevel: precRowId
        });

        while (
          stack.length > 0 &&
          stack[stack.length - 1] !== '(' &&
          getPrecedence(stack[stack.length - 1]) >= pCurrent
        ) {
          const topOp = stack[stack.length - 1];
          const popped = stack.pop();
          output += popped;
          steps.push({
            tokenIdx: i,
            token: c,
            stack: [...stack],
            output: output,
            title: `Pop High Precedence Operator '${popped}'`,
            desc: `Stack top <strong>'${topOp}'</strong> has precedence >= <strong>'${c}'</strong>. Pop '${popped}' to output.`,
            codeLine: 'inf-c-13',
            precLevel: precRowId
          });
        }

        stack.push(c);
        steps.push({
          tokenIdx: i,
          token: c,
          stack: [...stack],
          output: output,
          title: `Push Operator '${c}'`,
          desc: `Push operator <strong>'${c}'</strong> onto Operator Stack.`,
          codeLine: 'inf-c-14',
          precLevel: precRowId
        });
      }
    }

    // Empty remaining stack
    while (stack.length > 0) {
      const popped = stack.pop();
      output += popped;
      steps.push({
        tokenIdx: tokens.length,
        token: 'END',
        stack: [...stack],
        output: output,
        title: `Flush Remaining Stack: '${popped}'`,
        desc: `Expression scan complete. Pop remaining operator <strong>'${popped}'</strong> to output.`,
        codeLine: 'inf-c-9',
        precLevel: 0
      });
    }

    // Final state
    steps.push({
      tokenIdx: tokens.length,
      token: 'COMPLETE',
      stack: [],
      output: output,
      title: 'Conversion Complete!',
      desc: `Final Postfix Expression: <strong>${output}</strong>`,
      codeLine: 'inf-c-16',
      precLevel: 0
    });

    return { tokens, steps };
  }

  let currentInfixData = { tokens: [], steps: [] };

  function loadInfixExpression(expr) {
    if (infixAutoTimer) clearInterval(infixAutoTimer);
    if (btnInfixAuto) btnInfixAuto.textContent = '▶ Auto Play';

    const cleanExpr = expr || (infixInput ? infixInput.value.trim() : 'A + B * C');
    currentInfixData = generateInfixSteps(cleanExpr);
    infixSteps = currentInfixData.steps;
    currentInfixStep = 0;

    if (tfInfixVal) tfInfixVal.textContent = cleanExpr;
    renderInfixStep();
  }

  function renderInfixStep() {
    if (!infixSteps || infixSteps.length === 0) return;
    const step = infixSteps[currentInfixStep];

    // Render Token Chips
    if (infixTokensContainer) {
      infixTokensContainer.innerHTML = '';
      currentInfixData.tokens.forEach((t, idx) => {
        const chip = document.createElement('div');
        chip.className = 'token-chip';
        if (idx === step.tokenIdx) chip.classList.add('current');
        else if (idx < step.tokenIdx) chip.classList.add('processed');
        chip.textContent = t;
        infixTokensContainer.appendChild(chip);
      });
    }

    // Render Operator Stack
    if (opStackFrame) {
      opStackFrame.innerHTML = '';
      step.stack.forEach((val, idx) => {
        const el = document.createElement('div');
        el.className = 'stack-element';
        if (idx === step.stack.length - 1) el.classList.add('top-item');
        el.innerHTML = `<span>${val}</span>`;
        opStackFrame.appendChild(el);
      });
    }

    // Render Output
    if (infixOutputBox) {
      if (!step.output) {
        infixOutputBox.innerHTML = `<span style="color: var(--text-muted); font-weight: 400; font-size: 0.95rem;">(Output empty)</span>`;
      } else {
        infixOutputBox.innerHTML = '';
        step.output.split('').forEach(ch => {
          const badge = document.createElement('span');
          badge.className = 'output-badge';
          badge.textContent = ch;
          infixOutputBox.appendChild(badge);
        });
      }
    }

    // Info & Explanations
    if (infixStepTitle) infixStepTitle.innerHTML = step.title;
    if (infixStepDesc) infixStepDesc.innerHTML = step.desc;
    if (infixCurrentTokenInfo) {
      infixCurrentTokenInfo.innerHTML = `Current Token: <strong style="color: var(--accent-light);">${step.token || 'None'}</strong>`;
    }
    if (tfPostfixVal) tfPostfixVal.textContent = step.output || '...';

    // Highlight C Code Line
    document.querySelectorAll('#infix-code-block .code-line').forEach(el => el.classList.remove('active'));
    if (step.codeLine) {
      const codeEl = document.getElementById(step.codeLine);
      if (codeEl) codeEl.classList.add('active');
    }

    // Highlight Precedence Row
    document.querySelectorAll('.precedence-table tr').forEach(tr => tr.classList.remove('active-row'));
    if (step.precLevel > 0) {
      const precRow = document.getElementById(`prec-row-${step.precLevel}`);
      if (precRow) precRow.classList.add('active-row');
    }
  }

  window.loadInfixPreset = (expr) => {
    if (infixInput) infixInput.value = expr;
    loadInfixExpression(expr);
  };

  if (btnInfixLoad) btnInfixLoad.addEventListener('click', () => loadInfixExpression());
  if (btnInfixNext) {
    btnInfixNext.addEventListener('click', () => {
      if (currentInfixStep < infixSteps.length - 1) {
        currentInfixStep++;
        renderInfixStep();
      }
    });
  }
  if (btnInfixPrev) {
    btnInfixPrev.addEventListener('click', () => {
      if (currentInfixStep > 0) {
        currentInfixStep--;
        renderInfixStep();
      }
    });
  }
  if (btnInfixReset) {
    btnInfixReset.addEventListener('click', () => {
      currentInfixStep = 0;
      renderInfixStep();
    });
  }
  if (btnInfixAuto) {
    btnInfixAuto.addEventListener('click', () => {
      if (infixAutoTimer) {
        clearInterval(infixAutoTimer);
        infixAutoTimer = null;
        btnInfixAuto.textContent = '▶ Auto Play';
      } else {
        btnInfixAuto.textContent = '⏸ Pause';
        const speed = infixSpeedSlider ? parseInt(infixSpeedSlider.value) : 1000;
        infixAutoTimer = setInterval(() => {
          if (currentInfixStep < infixSteps.length - 1) {
            currentInfixStep++;
            renderInfixStep();
          } else {
            clearInterval(infixAutoTimer);
            infixAutoTimer = null;
            btnInfixAuto.textContent = '▶ Auto Play';
          }
        }, speed);
      }
    });
  }

  if (infixSpeedSlider) {
    infixSpeedSlider.addEventListener('input', (e) => {
      if (infixSpeedVal) infixSpeedVal.textContent = (e.target.value / 1000).toFixed(1) + 's';
    });
  }

  loadInfixExpression('A + B * C');

  // ==========================================
  // SECTION 3: POSTFIX EVALUATION
  // ==========================================
  let evalSteps = [];
  let currentEvalStep = 0;
  let evalAutoTimer = null;

  const evalInput = document.getElementById('eval-input');
  const btnEvalLoad = document.getElementById('btn-eval-load');
  const btnEvalNext = document.getElementById('btn-eval-next');
  const btnEvalPrev = document.getElementById('btn-eval-prev');
  const btnEvalAuto = document.getElementById('btn-eval-autoplay');
  const btnEvalReset = document.getElementById('btn-eval-reset');
  const evalSpeedSlider = document.getElementById('eval-speed');
  const evalSpeedVal = document.getElementById('eval-speed-val');

  const evalTokensContainer = document.getElementById('eval-tokens-container');
  const evalStackFrame = document.getElementById('eval-stack-frame');
  const evalCurrentTokenInfo = document.getElementById('eval-current-token-info');
  const evalStepDesc = document.getElementById('eval-step-desc');

  const evalOrderBox = document.getElementById('eval-order-box');
  const evalVarA = document.getElementById('eval-var-a');
  const evalVarB = document.getElementById('eval-var-b');
  const evalOpSymbol = document.getElementById('eval-op-symbol');
  const evalResultVal = document.getElementById('eval-result-val');

  function generateEvalSteps(expression) {
    const steps = [];
    const tokens = expression.replace(/\s+/g, '').split('');
    const stack = [];

    steps.push({
      tokenIdx: -1,
      token: '',
      stack: [],
      desc: 'Postfix expression loaded. Click Next Step to evaluate tokens left to right.',
      codeLine: 'ev-c-1',
      orderData: null
    });

    for (let i = 0; i < tokens.length; i++) {
      const c = tokens[i];

      if (/\d/.test(c)) {
        const val = parseInt(c, 10);
        stack.push(val);
        steps.push({
          tokenIdx: i,
          token: c,
          stack: [...stack],
          desc: `<strong>'${c}'</strong> is a numeric operand. Push <code>${val}</code> onto Operand Stack.`,
          codeLine: 'ev-c-4',
          orderData: null
        });
      } else if (['+', '-', '*', '/', '%', '^'].includes(c)) {
        if (stack.length < 2) {
          steps.push({
            tokenIdx: i,
            token: c,
            stack: [...stack],
            desc: `<strong style="color: #fca5a5;">INVALID POSTFIX:</strong> Insufficient operands on stack for operator <strong>'${c}'</strong>.`,
            codeLine: 'ev-c-5',
            orderData: null
          });
          break;
        }

        const b = stack.pop(); // Top item
        const a = stack.pop(); // Second item
        let res = 0;
        switch (c) {
          case '+': res = a + b; break;
          case '-': res = a - b; break;
          case '*': res = a * b; break;
          case '/': res = b !== 0 ? Math.floor(a / b) : 'ERR'; break;
          case '%': res = a % b; break;
          case '^': res = Math.pow(a, b); break;
        }

        stack.push(res);

        let codeLineId = 'ev-c-9';
        if (c === '-') codeLineId = 'ev-c-10';
        if (c === '*') codeLineId = 'ev-c-11';
        if (c === '/') codeLineId = 'ev-c-12';

        steps.push({
          tokenIdx: i,
          token: c,
          stack: [...stack],
          desc: `Operator <strong>'${c}'</strong> encountered! Pop <code>b = ${b}</code> (top) and <code>a = ${a}</code> (2nd). Compute <code>${a} ${c} ${b} = ${res}</code> and push <code>${res}</code> back.`,
          codeLine: codeLineId,
          orderData: { a, b, op: c, res }
        });
      }
    }

    if (stack.length === 1) {
      steps.push({
        tokenIdx: tokens.length,
        token: 'END',
        stack: [...stack],
        desc: `Evaluation complete! Final answer on stack top: <strong style="color: #10b981; font-size: 1.2rem;">${stack[0]}</strong>`,
        codeLine: 'ev-c-16',
        orderData: null
      });
    }

    return { tokens, steps };
  }

  let currentEvalData = { tokens: [], steps: [] };

  function loadEvalExpression(expr) {
    if (evalAutoTimer) clearInterval(evalAutoTimer);
    if (btnEvalAuto) btnEvalAuto.textContent = '▶ Auto Play';

    const cleanExpr = expr || (evalInput ? evalInput.value.trim() : '23*54*+9-');
    currentEvalData = generateEvalSteps(cleanExpr);
    evalSteps = currentEvalData.steps;
    currentEvalStep = 0;

    renderEvalStep();
  }

  function renderEvalStep() {
    if (!evalSteps || evalSteps.length === 0) return;
    const step = evalSteps[currentEvalStep];

    // Tokens Display
    if (evalTokensContainer) {
      evalTokensContainer.innerHTML = '';
      currentEvalData.tokens.forEach((t, idx) => {
        const chip = document.createElement('div');
        chip.className = 'token-chip';
        if (idx === step.tokenIdx) chip.classList.add('current');
        else if (idx < step.tokenIdx) chip.classList.add('processed');
        chip.textContent = t;
        evalTokensContainer.appendChild(chip);
      });
    }

    // Operand Stack Display
    if (evalStackFrame) {
      evalStackFrame.innerHTML = '';
      step.stack.forEach((val, idx) => {
        const el = document.createElement('div');
        el.className = 'stack-element';
        if (idx === step.stack.length - 1) el.classList.add('top-item');
        el.innerHTML = `<span>${val}</span>`;
        evalStackFrame.appendChild(el);
      });
    }

    // Descriptions & Token info
    if (evalStepDesc) evalStepDesc.innerHTML = step.desc;
    if (evalCurrentTokenInfo) {
      evalCurrentTokenInfo.innerHTML = `Current Token: <strong style="color: var(--accent-light);">${step.token || 'None'}</strong>`;
    }

    // Operator calculation order callout box
    if (step.orderData) {
      if (evalOrderBox) evalOrderBox.style.display = 'block';
      if (evalVarA) evalVarA.textContent = step.orderData.a;
      if (evalVarB) evalVarB.textContent = step.orderData.b;
      if (evalOpSymbol) evalOpSymbol.textContent = step.orderData.op;
      if (evalResultVal) evalResultVal.textContent = step.orderData.res;
    } else {
      if (evalOrderBox) evalOrderBox.style.display = 'none';
    }

    // Highlight C code
    document.querySelectorAll('#eval-code-block .code-line').forEach(el => el.classList.remove('active'));
    if (step.codeLine) {
      const codeEl = document.getElementById(step.codeLine);
      if (codeEl) codeEl.classList.add('active');
    }
  }

  window.loadEvalPreset = (expr) => {
    if (evalInput) evalInput.value = expr;
    loadEvalExpression(expr);
  };

  if (btnEvalLoad) btnEvalLoad.addEventListener('click', () => loadEvalExpression());
  if (btnEvalNext) {
    btnEvalNext.addEventListener('click', () => {
      if (currentEvalStep < evalSteps.length - 1) {
        currentEvalStep++;
        renderEvalStep();
      }
    });
  }
  if (btnEvalPrev) {
    btnEvalPrev.addEventListener('click', () => {
      if (currentEvalStep > 0) {
        currentEvalStep--;
        renderEvalStep();
      }
    });
  }
  if (btnEvalReset) {
    btnEvalReset.addEventListener('click', () => {
      currentEvalStep = 0;
      renderEvalStep();
    });
  }
  if (btnEvalAuto) {
    btnEvalAuto.addEventListener('click', () => {
      if (evalAutoTimer) {
        clearInterval(evalAutoTimer);
        evalAutoTimer = null;
        btnEvalAuto.textContent = '▶ Auto Play';
      } else {
        btnEvalAuto.textContent = '⏸ Pause';
        const speed = evalSpeedSlider ? parseInt(evalSpeedSlider.value) : 1000;
        evalAutoTimer = setInterval(() => {
          if (currentEvalStep < evalSteps.length - 1) {
            currentEvalStep++;
            renderEvalStep();
          } else {
            clearInterval(evalAutoTimer);
            evalAutoTimer = null;
            btnEvalAuto.textContent = '▶ Auto Play';
          }
        }, speed);
      }
    });
  }

  if (evalSpeedSlider) {
    evalSpeedSlider.addEventListener('input', (e) => {
      if (evalSpeedVal) evalSpeedVal.textContent = (e.target.value / 1000).toFixed(1) + 's';
    });
  }

  loadEvalExpression('23*54*+9-');

  // ==========================================
  // SECTION 5: QUIZ CHALLENGE ("TEST YOURSELF")
  // ==========================================
  const quizQuestions = [
    { expr: '8 + 2 * 3 - 4', postfix: '823*+4-', result: 10 },
    { expr: '(5 + 3) * (8 - 2)', postfix: '53+82-*', result: 48 },
    { expr: '9 + 6 / 3 - 2', postfix: '963/+2-', result: 9 }
  ];

  let currentQuizIdx = 0;

  const quizExprBox = document.getElementById('quiz-question-expr');
  const quizAnsPostfix = document.getElementById('quiz-ans-postfix');
  const quizAnsResult = document.getElementById('quiz-ans-result');
  const btnQuizSubmit = document.getElementById('btn-quiz-submit');
  const btnQuizNew = document.getElementById('btn-quiz-new');
  const quizFeedbackBox = document.getElementById('quiz-feedback-box');

  function loadQuizQuestion() {
    const q = quizQuestions[currentQuizIdx];
    if (quizExprBox) quizExprBox.textContent = q.expr;
    if (quizAnsPostfix) quizAnsPostfix.value = '';
    if (quizAnsResult) quizAnsResult.value = '';
    if (quizFeedbackBox) quizFeedbackBox.style.display = 'none';
  }

  if (btnQuizSubmit) {
    btnQuizSubmit.addEventListener('click', () => {
      const q = quizQuestions[currentQuizIdx];
      const userPostfix = quizAnsPostfix ? quizAnsPostfix.value.trim().replace(/\s+/g, '') : '';
      const userResult = quizAnsResult ? parseInt(quizAnsResult.value.trim(), 10) : NaN;

      const isPostfixCorrect = userPostfix === q.postfix;
      const isResultCorrect = userResult === q.result;

      if (quizFeedbackBox) {
        quizFeedbackBox.style.display = 'block';
        if (isPostfixCorrect && isResultCorrect) {
          quizFeedbackBox.className = 'status-badge success';
          quizFeedbackBox.innerHTML = `🎉 <strong>CORRECT!</strong> Postfix: <code>${q.postfix}</code> | Result: <code>${q.result}</code>`;
        } else {
          quizFeedbackBox.className = 'status-badge error';
          quizFeedbackBox.innerHTML = `
            ❌ <strong>Not quite!</strong><br>
            Correct Postfix: <code>${q.postfix}</code><br>
            Correct Result: <code>${q.result}</code>
          `;
        }
      }
    });
  }

  if (btnQuizNew) {
    btnQuizNew.addEventListener('click', () => {
      currentQuizIdx = (currentQuizIdx + 1) % quizQuestions.length;
      loadQuizQuestion();
    });
  }

  loadQuizQuestion();
});
