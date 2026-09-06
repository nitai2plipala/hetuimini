async page => {
    const results = {};

    async function logText(sectionIdx) {
        return await page.$eval(`.section:nth-of-type(${sectionIdx}) .event-log span`, el => el.textContent.trim());
    }

    // 基本事件: click
    await page.getByRole('button', { name: '点击事件 (@click)' }).click();
    await page.waitForTimeout(50);
    results['基本_click'] = await logText(1);

    // dblclick
    await page.getByRole('button', { name: '双击事件 (@dblclick)' }).dblclick();
    await page.waitForTimeout(50);
    results['基本_dblclick'] = await logText(1);

    // input
    await page.$eval('.section:nth-of-type(1) input[placeholder*="输入事件"]', el => el.value = '');
    await page.fill('.section:nth-of-type(1) input[placeholder*="输入事件"]', 'hello');
    await page.waitForTimeout(50);
    results['基本_input'] = await logText(1);

    // change
    await page.fill('.section:nth-of-type(1) input[placeholder*="变化事件"]', 'world');
    await page.$eval('.section:nth-of-type(1) input[placeholder*="变化事件"]', el => el.dispatchEvent(new Event('change')));
    await page.waitForTimeout(50);
    results['基本_change'] = await logText(1);

    // focus
    await page.$eval('.section:nth-of-type(1) input[placeholder*="聚焦事件"]', el => el.focus());
    await page.waitForTimeout(50);
    results['基本_focus'] = await logText(1);

    // blur
    await page.$eval('.section:nth-of-type(1) input[placeholder*="失焦事件"]', el => { el.focus(); el.blur(); });
    await page.waitForTimeout(50);
    results['基本_blur'] = await logText(1);

    // 键盘事件 keyup
    await page.fill('.section:nth-of-type(2) input[placeholder*="按键弹起"]', 'a');
    await page.waitForTimeout(50);
    results['键盘_keyup'] = await logText(2);

    // 鼠标事件 mouseover/mouseout
    const mouseDiv = '.section:nth-of-type(3) div[HeTui]';
    await page.hover(mouseDiv);
    await page.waitForTimeout(50);
    results['鼠标_mouseover'] = await logText(3);
    // mouseout - 移到另一个区域
    await page.hover('.section:nth-of-type(3) div[HeTui]:nth-of-type(2)');
    await page.waitForTimeout(50);
    results['鼠标_mouseout'] = await logText(3);

    // 表单提交 - @submit.prevent
    await page.getByRole('button', { name: '提交 (@submit.prevent)' }).click();
    await page.waitForTimeout(50);
    results['表单_submit'] = await logText(4);

    // 表单重置
    await page.getByRole('button', { name: '重置 (@reset)' }).click();
    await page.waitForTimeout(50);
    results['表单_reset'] = await logText(4);

    // 修饰符: once
    await page.getByRole('button', { name: '只触发一次 (@click.once)' }).click();
    await page.waitForTimeout(50);
    results['修饰符_once_第一次'] = await logText(5);
    // 再点一次，不应触发
    await page.getByRole('button', { name: '只触发一次 (@click.once)' }).click();
    await page.waitForTimeout(50);
    results['修饰符_once_第二次'] = await logText(5);

    // 修饰符: stop
    await page.getByRole('button', { name: '阻止冒泡 (@click.stop)' }).click();
    await page.waitForTimeout(50);
    results['修饰符_stop'] = await logText(5);

    // 修饰符: prevent
    await page.getByRole('button', { name: '阻止默认 (@click.prevent)' }).click();
    await page.waitForTimeout(50);
    results['修饰符_prevent'] = await logText(5);

    // 修饰符: self
    await page.getByRole('button', { name: '只在自身触发 (@click.self)' }).click();
    await page.waitForTimeout(50);
    results['修饰符_self'] = await logText(5);

    // 修饰符: ctrl
    await page.getByRole('button', { name: 'Ctrl+点击 (@click.ctrl)' }).click({ modifiers: ['Control'] });
    await page.waitForTimeout(50);
    results['修饰符_ctrl'] = await logText(5);

    return JSON.stringify(results, null, 2);
}
