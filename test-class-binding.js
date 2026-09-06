async page => {
    const results = {};

    // 全部在浏览器内执行，避免选择器上下文问题
    async function clickAndWait(btnText) {
        await page.getByRole('button', { name: btnText }).click();
        await page.waitForTimeout(80);
    }

    async function getSectionState(btnText) {
        return await page.evaluate((text) => {
            const btns = [...document.querySelectorAll('button')];
            const btn = btns.find(b => b.textContent.includes(text));
            if (!btn) return { error: 'button not found: ' + text };
            const section = btn.closest('.section');
            if (!section) return { error: 'section not found' };
            const div = section.querySelector('.test-box > div[HeTui]');
            const lastP = section.querySelector('p:last-child');
            return {
                divClass: div ? div.className : 'div not found',
                lastP: lastP ? lastP.textContent.trim() : 'p not found'
            };
        }, btnText);
    }

    // 测试1
    await clickAndWait('设置 class-b');
    results['测试1_setClassB'] = await getSectionState('设置 class-b');
    await clickAndWait('清除类名');
    results['测试1_clearClass'] = await getSectionState('清除类名');

    // 测试2
    await clickAndWait('设置用户');
    results['测试2_setRoleUser'] = await getSectionState('设置用户');

    // 测试3: toggleActive true→false（测试3里的，第一个“切换 active”）
    await page.getByRole('button', { name: '切换 active' }).first().click();
    await page.waitForTimeout(80);
    results['测试3_toggleActive_false'] = await getSectionState('切换 highlight');

    // 测试4: toggleState false→true
    await clickAndWait('切换状态');
    results['测试4_toggleState_true'] = await getSectionState('状态: active');

    // 测试5
    await clickAndWait('用户状态 B');
    results['测试5_setUserStateB'] = await getSectionState('用户状态 A');

    // 测试6
    await clickAndWait('切换动态类名');
    await page.getByRole('button', { name: '切换 active' }).nth(1).click();  // 测试6里的“切换 active”
    await page.waitForTimeout(80);
    await clickAndWait('切换 large');    // false→true
    results['测试6_mixed'] = await getSectionState('切换 large');

    // 测试4的显示文本（当前状态: stateClass 计算属性）
    results['testResults'] = await page.$eval('#testResults', el => el.textContent.trim());

    return JSON.stringify(results, null, 2);
}
