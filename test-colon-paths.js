async page => {
    const results = {};

    async function getSpanText(selector) {
        return await page.$eval(selector, el => el.textContent.trim()).catch(() => 'SEL_NOT_FOUND:' + selector);
    }

    // 测试1: 初始嵌套对象绑定
    results['测试1_初始'] = {
        userName: await getSpanText('.section:nth-of-type(1) .test-result p:nth-child(1) .success'),
        userEmail: await getSpanText('.section:nth-of-type(1) .test-result p:nth-child(2) .success'),
        userAge: await getSpanText('.section:nth-of-type(1) .test-result p:nth-child(3) .success')
    };

    // 测试3: 点"增加年龄"两次
    await page.getByRole('button', { name: '增加年龄' }).click();
    await page.getByRole('button', { name: '增加年龄' }).click();
    await page.waitForTimeout(100);
    results['测试3_增加年龄x2'] = {
        age: await getSpanText('.section:nth-of-type(3) .test-result p:nth-child(1) .success'),
        ageChanges: await getSpanText('.section:nth-of-type(3) .test-result p:nth-child(2) .success')
    };

    // 测试4: 点"切换状态"（true→false，active 类应移除）
    await page.getByRole('button', { name: '切换状态' }).click();
    await page.waitForTimeout(100);
    const t4class = await page.evaluate(() => {
        const div = document.querySelector('.test-element');
        return { className: div ? div.className : 'not found' };
    });
    // 点"改变颜色"，验证 color 样式变化（#3f6085 → #f22314）
    await page.getByRole('button', { name: '改变颜色' }).click();
    await page.waitForTimeout(100);
    const t4color = await page.evaluate(() => {
        const divs = [...document.querySelectorAll('.test-element')];
        const colorDiv = divs.find(d => d.style.color);
        return {
            color: colorDiv ? colorDiv.style.color : 'not found',
            colorText: document.querySelector('.section:nth-of-type(4) .test-result p:nth-child(2) .success')?.textContent?.trim()
        };
    });
    results['测试4_切换状态+改变颜色'] = { activeDivClass: t4class.className, ...t4color };

    // 测试5: foreach 初始项数 + 添加项目（验证嵌套数组 push 响应式）
    const foreachInitCount = await page.$$eval('.section:nth-of-type(5) ul li', els => els.length);
    const beforeData = await page.evaluate(() => ({
        itemsLength: window.app.user.items.length,
        itemsData: window.app.user.items.map(i => ({ name: i.name, price: i.price }))
    }));
    await page.getByRole('button', { name: '添加项目' }).click();
    await page.waitForTimeout(100);
    const afterData = await page.evaluate(() => ({
        itemsLength: window.app.user.items.length,
        domLiCount: document.querySelectorAll('.section:nth-of-type(5) ul li').length
    }));
    const foreachLastItem = await page.$$eval('.section:nth-of-type(5) ul li', els => els[els.length - 1]?.textContent?.trim());
    results['测试5_foreach_push'] = {
        初始项数: foreachInitCount,
        添加后数据层: afterData.itemsLength,
        添加后DOM: afterData.domLiCount,
        末项: foreachLastItem
    };

    // 测试5 补充: 点"重置用户"（整体替换 items），验证响应式更新
    await page.getByRole('button', { name: '重置用户' }).click();
    await page.waitForTimeout(200);
    const afterReset = await page.evaluate(() => ({
        itemsLength: window.app.user.items.length,
        domLiCount: document.querySelectorAll('.section:nth-of-type(5) ul li').length
    }));
    results['测试5_resetUser整体替换'] = afterReset;

    // 测试5: 点"切换详细信息"（if: showDetails true→false）
    const ifBefore = await page.evaluate(() => {
        const detailP = [...document.querySelectorAll('p')].find(p => p.textContent.includes('详细信息已显示'));
        return detailP ? '存在' : '不存在';
    });
    await page.getByRole('button', { name: '切换详细信息' }).click();
    await page.waitForTimeout(200);
    const ifAfter = await page.evaluate(() => {
        const detailP = [...document.querySelectorAll('p')].find(p => p.textContent.includes('详细信息已显示'));
        return detailP ? '存在(未隐藏!)' : '不存在(已隐藏)';
    });
    results['测试5_if'] = { 切换前: ifBefore, 切换后: ifAfter };

    // 测试5: 点"切换可见性"（show: isVisible true→false，应 display:none）
    await page.getByRole('button', { name: '切换可见性' }).click();
    await page.waitForTimeout(100);
    const showDisplay = await page.evaluate(() => {
        const divs = [...document.querySelectorAll('.section:nth-of-type(5) div[HeTui]')];
        const target = divs.find(d => d.textContent.includes('此内容根据'));
        return target ? target.style.display : 'not found';
    });
    results['测试5_show'] = { display: showDisplay };

    // 测试6: 不填表单直接点"验证表单"，应显示3个错误
    await page.getByRole('button', { name: '验证表单' }).click();
    await page.waitForTimeout(100);
    results['测试6_验证空表单'] = {
        usernameError: await getSpanText('.section:nth-of-type(6) .test-result p:nth-child(1) .error'),
        emailError: await getSpanText('.section:nth-of-type(6) .test-result p:nth-child(2) .error'),
        passwordError: await getSpanText('.section:nth-of-type(6) .test-result p:nth-child(3) .error')
    };

    return JSON.stringify(results, null, 2);
}
