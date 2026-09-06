async page => {
    const results = {};

    async function spanText(container, pIdx) {
        return await page.$eval(`${container} p:nth-of-type(${pIdx}) span`, el => el.textContent.trim());
    }

    // 初始值
    results['初始_app1'] = { count: await spanText('#app1-container', 1), message: await spanText('#app1-container', 2) };
    results['初始_app2'] = { count: await spanText('#app2-container', 1), message: await spanText('#app2-container', 2) };
    results['初始_app3'] = { count: await spanText('#app3-container', 1), message: await spanText('#app3-container', 2) };

    // app1 点 +1（+1），app2 点 +1（+2），app3 点 +1（+5）
    await page.locator('#app1-container').getByRole('button', { name: '+1' }).click();
    await page.locator('#app2-container').getByRole('button', { name: '+1' }).click();
    await page.locator('#app3-container').getByRole('button', { name: '+1' }).click();
    await page.waitForTimeout(100);

    results['操作后_app1'] = { count: await spanText('#app1-container', 1) };  // 0→1
    results['操作后_app2'] = { count: await spanText('#app2-container', 1) };  // 10→12
    results['操作后_app3'] = { count: await spanText('#app3-container', 1) };  // 100→105

    // app1 点 -1
    await page.locator('#app1-container').getByRole('button', { name: '-1' }).click();
    await page.waitForTimeout(100);
    results['减后_app1'] = { count: await spanText('#app1-container', 1) };  // 1→0

    // app1 重置
    await page.locator('#app1-container').getByRole('button', { name: '重置' }).click();
    await page.waitForTimeout(100);
    results['重置后_app1'] = { count: await spanText('#app1-container', 1) };  // 0→0

    // app2 输入消息，验证双向绑定且不影响 app1/app3
    await page.fill('#app2-container input', 'app2新消息');
    await page.waitForTimeout(100);
    results['输入后_app1'] = { message: await spanText('#app1-container', 2) };
    results['输入后_app2'] = { message: await spanText('#app2-container', 2), inputVal: await page.$eval('#app2-container input', el => el.value) };
    results['输入后_app3'] = { message: await spanText('#app3-container', 2) };

    // 等 setTimeout 2秒后 message 更新
    await page.waitForTimeout(2500);
    results['2秒后_app1'] = { message: await spanText('#app1-container', 2) };
    results['2秒后_app2'] = { message: await spanText('#app2-container', 2) };
    results['2秒后_app3'] = { message: await spanText('#app3-container', 2) };

    return JSON.stringify(results, null, 2);
}
