const axios = require('axios');
const readline = require('readline');
const chalk = require('chalk'); // 用于彩色输出

// 思考动画帧（旋转效果）
const thinkingFrames = ['◐', '◓', '◑', '◒'];
let currentFrame = 0;
let thinkingInterval = null;

// 从环境变量获取配置（支持自定义平台）
const config = {
  apiKey: process.env.API_KEY || '',
  apiUrl: process.env.API_URL || 'https://api.mindcraft.com.cn/v1/chat/completions', // 默认智匠平台。
  model: process.env.MODEL || 'gpt-4.1-free'
};

// 验证必要配置
if (!config.apiKey || !config.apiUrl) {
  console.error('错误：请设置API_KEY和API_URL环境变量');
  process.exit(1);
}

// 创建命令行接口
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

/**
 * 与OpenAI模型对话的核心函数
 * @param {string} prompt 用户输入的问题
 * @returns {Promise<string>} 模型返回的回答
 */
/**
 * 与自定义API平台对话的核心函数
 * @param {string} prompt 用户输入的问题
 * @returns {Promise<string>} 模型返回的回答
 */
// 启动思考动画
function startThinkingAnimation() {
  thinkingInterval = setInterval(() => {
    currentFrame = (currentFrame + 1) % thinkingFrames.length;
    readline.clearLine(process.stdout, 0); // 清除当前行
    readline.cursorTo(process.stdout, 0); // 光标回到行首
    process.stdout.write(chalk.yellow(`AI思考中 ${thinkingFrames[currentFrame]}`));
  }, 200);
}

// 停止思考动画并显示回答
function stopThinkingAnimation(answer) {
  clearInterval(thinkingInterval);
  readline.clearLine(process.stdout, 0);
  readline.cursorTo(process.stdout, 0);
  console.log(chalk.green(`AI: ${answer}\n`)); // 绿色回答显示
}

/**
 * 与自定义API平台对话的核心函数
 * @param {string} prompt 用户输入的问题
 * @returns {Promise<string>} 模型返回的回答
 */
async function chatWithAI(prompt, systemPrompt) {
  try {
    const response = await axios.post(config.apiUrl, {
      model: config.model,
      messages: [
        { role: 'system', content: systemPrompt }, // 个性化提示词
        { role: 'user', content: prompt }
      ]
    }, {
      headers: { 'Authorization': `Bearer ${config.apiKey}` }
    });
    return response.data.choices?.[0]?.message?.content || '无有效回答';
  } catch (error) {
    console.error(chalk.red(`与${config.apiUrl}交互失败:`), error.response?.data?.error?.message || error.message);
    return '抱歉，当前无法获取回答';
  }
}

// 对话存储配置
  const CONVERSATIONS_FILE = 'conversations.json';
  let allConversations = [];

  // 初始化对话数据
  function initConversations() {
    try {
      if (fs.existsSync(CONVERSATIONS_FILE)) {
        allConversations = JSON.parse(fs.readFileSync(CONVERSATIONS_FILE, 'utf8'));
      }
    } catch (error) {
      console.log(chalk.yellow('加载对话记录失败，将使用新对话: '), error.message);
    }
  }

  // 保存所有对话函数（写入本地文件）
  function saveAllConversations() {
    try {
      fs.writeFileSync(CONVERSATIONS_FILE, JSON.stringify(allConversations), 'utf8');
      console.log(chalk.green('所有对话保存成功！'));
    } catch (error) {
      console.log(chalk.yellow('对话保存失败: '), error.message);
    }
  }
  
  // 删除指定对话函数
  function deleteConversation(id) {
    const index = allConversations.findIndex(conv => conv.id === id);
    if (index !== -1) {
      allConversations.splice(index, 1);
      saveAllConversations();
      console.log(chalk.green(`对话${id}删除成功！`));
    } else {
      console.log(chalk.red(`未找到编号为${id}的对话`));
    }
  }

  // 启动聊天循环
  async function startChat() {
    initConversations();

    // 主菜单：选择对话或新建
    let currentConversation;
    while (true) {
      console.log(chalk.bold.blue('\n===== 对话管理菜单 ====='));
      allConversations.forEach(conv => {
        console.log(`[${conv.id}] ${new Date(conv.timestamp).toLocaleString()} - ${conv.history[0]?.content?.slice(0, 20)}...`);
      });
      const choice = await new Promise(resolve => {
        rl.question(chalk.blue('请输入对话编号启动（输入0新建）: '), resolve);
      });

      if (choice === '0') {
        currentConversation = {
          id: allConversations.length + 1,
          timestamp: Date.now(),
          history: []
        };
        console.log(chalk.cyan('已创建新对话，开始聊天（输入/可退出当前对话）'));
        break;
      } else {
        const targetConv = allConversations.find(conv => conv.id === parseInt(choice));
        if (targetConv) {
          currentConversation = targetConv;
          console.log(chalk.cyan(`已加载对话${choice}: ${targetConv.history.map(msg => `\n${msg.role}: ${msg.content}`).join('')}`));
          break;
        } else {
          console.log(chalk.red('无效的对话编号，请重新输入'));
        }
      }
    }
  const fs = require('fs');
  const CONFIG_FILE = 'prompt-config.json';
  
  // 读取已保存的提示词
  function getSavedPrompt() {
    try {
      if (fs.existsSync(CONFIG_FILE)) {
        const data = fs.readFileSync(CONFIG_FILE, 'utf8');
        return JSON.parse(data).prompt;
      }
      return null;
    } catch (error) {
      console.log(chalk.yellow('读取保存提示词失败，将使用新输入: '), error.message);
      return null;
    }
  }
  
  // 保存提示词
  function savePrompt(prompt) {
    try {
      fs.writeFileSync(CONFIG_FILE, JSON.stringify({ prompt }), 'utf8');
      console.log(chalk.green('提示词保存成功！'));
    } catch (error) {
      console.log(chalk.yellow('提示词保存失败: '), error.message);
    }
  }
  
  console.log(chalk.bold.cyan('欢迎使用MC OpenAI聊天程序！'));
  
  // 检查是否有已保存的提示词
  const savedPrompt = getSavedPrompt();
  let systemPrompt;
  if (savedPrompt) {
    systemPrompt = await new Promise(resolve => {
      rl.question(chalk.blue('检测到已保存的提示词，是否使用？(Y/n): '), resolve);
    });
    systemPrompt = systemPrompt.toLowerCase() !== 'n' ? savedPrompt : null;
  }
  
  // 获取新提示词（如果未使用保存的）
  if (!systemPrompt) {
    systemPrompt = await new Promise(resolve => {
      rl.question(chalk.green('请输入AI个性化提示词（例如\'你是一位MC老玩家，擅长解答游戏问题\'）: '), resolve);
    });
    // 询问是否保存新提示词
    const saveConfirm = await new Promise(resolve => {
      rl.question(chalk.blue('是否保存当前提示词？(Y/n): '), resolve);
    });
    if (saveConfirm.toLowerCase() !== 'n') savePrompt(systemPrompt);
  }
  console.log(chalk.gray(`已设置提示词: ${systemPrompt}\n`));

  while (true) {
    const prompt = await new Promise(resolve => {
        rl.question(chalk.cyan('你: '), resolve); // 青色输入提示
      });

      // 处理退出当前对话指令
      if (prompt === '/') {
        const saveConfirm = await new Promise(resolve => {
          rl.question(chalk.blue('是否保存当前对话？(Y/n): '), resolve);
        });
        if (saveConfirm.toLowerCase() !== 'n') {
          allConversations.push(currentConversation);
          saveAllConversations();
        }
        console.log(chalk.cyan('已退出当前对话，返回主菜单...'));
        startChat(); // 重新进入主菜单
        return;
      }

      if (prompt.toLowerCase() === 'exit') {
        // 退出前保存所有对话
        saveAllConversations();
        console.log(chalk.bold.yellow('再见！'));
        rl.close();
        break;
      }

currentConversation.history.push({ role: 'user', content: prompt });
    startThinkingAnimation(); // 启动思考动画
    const answer = await chatWithAI(prompt, systemPrompt);
    stopThinkingAnimation(answer); // 停止动画并显示回答
    currentConversation.history.push({ role: 'assistant', content: answer });
  }
}

// 启动程序
startChat();

// 提示配置方法
console.log('\n提示：可通过以下环境变量自定义配置：');
console.log('SET API_KEY=你的API密钥');
console.log('SET API_URL=自定义API地址（默认OpenAI）');
console.log('SET MODEL=模型名称（默认gpt-3.5-turbo）');
console.log('示例：SET API_URL=https://api.example.com/v1/chat/completions\n');