async page => {
    const results = {};

    async function divClass(n) {
        return await page.$eval(`.section:nth-of-type(${n}) .test-box`, el => el.className);
    }
    async function divStyle(n) {
        return await page.$eval(`.section:nth-of-type(${n}) .test-box`, el => ({
            color: el.style.color,
            backgroundColor: el.style.backgroundColor,
            fontSize: el.style.fontSize
        }));
    }

    // 测试1: 初始 class = "test-box" (isActive=true→active, isHighlighted=false, isLarge=false)
    results['测试1_初始'] = { class: await divClass(1) };
    // 点 toggleActive → false，active 移除
    await page.getByRole('button', { name: '切换active类' }).first().click();
    await page.waitForTimeout(80);
    results['测试1_toggleActive'] = { class: await divClass(1) };
    // 点 toggleHighlighted → true，加 highlight
    await page.getByRole('button', { name: '切换highlight类' }).click();
    await page.waitForTimeout(80);
    results['测试1_toggleHighlight'] = { class: await divClass(1) };
    // 点 toggleLarge → true，加 large
    await page.getByRole('button', { name: '切换large类' }).click();
    await page.waitForTimeout(80);
    results['测试1_toggleLarge'] = { class: await divClass(1) };

    // 测试2: 初始 style
    results['测试2_初始'] = await divStyle(2);
    // 点 cycleFontColor → red
    await page.getByRole('button', { name: '循环字体颜色' }).first().click();
    await page.waitForTimeout(80);
    results['测试2_cycleFontColor'] = await divStyle(2);
    // 点 cycleBgColor → #e0e0e0
    await page.getByRole('button', { name: '循环背景颜色' }).click();
    await page.waitForTimeout(80);
    results['测试2_cycleBgColor'] = await divStyle(2);
    // 点 cycleFontSize → 14px
    await page.getByRole('button', { name: '循环字体大小' }).click();
    await page.waitForTimeout(80);
    results['测试2_cycleFontSize'] = await divStyle(2);

    // 测试3: 初始 attr
    results['测试3_初始'] = await page.evaluate(() => {
        const a = document.querySelector('.section:nth-of-type(3) a');
        const input = document.querySelector('.section:nth-of-type(3) input');
        const img = document.querySelector('.section:nth-of-type(3) img');
        return {
            href: a?.getAttribute('href'),
            title: a?.getAttribute('title'),
            placeholder: input?.getAttribute('placeholder'),
            value: input?.getAttribute('value'),
            imgSrc: img?.getAttribute('src'),
            imgAlt: img?.getAttribute('alt'),
            imgWidth: img?.getAttribute('width')
        };
    });
    // 点 changeLink
    await page.getByRole('button', { name: '改变链接' }).click();
    await page.waitForTimeout(80);
    results['测试3_changeLink'] = await page.evaluate(() => {
        const a = document.querySelector('.section:nth-of-type(3) a');
        return { href: a?.getAttribute('href'), title: a?.getAttribute('title') };
    });
    // 点 changeImage
    await page.getByRole('button', { name: '改变图片' }).click();
    await page.waitForTimeout(80);
    results['测试3_changeImage'] = await page.evaluate(() => {
        const img = document.querySelector('.section:nth-of-type(3) img');
        return { src: img?.getAttribute('src'), alt: img?.getAttribute('alt'), width: img?.getAttribute('width') };
    });

    // 测试4: 混合指令 - 先点测试4的按钮（toggleActive/cycleFontColor 是 nth(1) 版本）
    await page.getByRole('button', { name: '切换active类' }).nth(1).click();
    await page.getByRole('button', { name: '改变颜色' }).click();
    await page.getByRole('button', { name: '改变提示' }).click();
    await page.waitForTimeout(80);
    results['测试4_交互后'] = {
        class: await divClass(4),
        style: await divStyle(4),
        title: await page.$eval('.section:nth-of-type(4) .test-box', el => el.getAttribute('title'))
    };

    // 测试5: 嵌套数据
    results['测试5_初始'] = await page.evaluate(() => {
        const spans = document.querySelectorAll('.section:nth-of-type(5) span');
        const img = document.querySelector('.section:nth-of-type(5) img');
        return {
            userName: spans[0]?.textContent?.trim(),
            userStatusSpanClass: spans[1]?.className,
            userColorSpan: spans[2]?.style?.color,
            avatarSrc: img?.getAttribute('src')
        };
    });

    // 测试结果
    results['testResults'] = await page.$eval('#testResults', el => el.textContent.trim());

    return JSON.stringify(results, null, 2);
}
