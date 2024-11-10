import React from 'react';

export const ContentSections = () => {
  const features = [
    {
      title: "智能批处理",
      description: "支持多文件同时转换，智能队列管理，自动分配系统资源，让批量转换更高效。",
      icon: "⚡️"
    },
    {
      title: "格式完整性保证",
      description: "采用专业的转换引擎，确保目录、图片、排版的完整保留，呈现原汁原味的阅读体验。",
      icon: "✨"
    },
    {
      title: "隐私安全",
      description: "所有转换都在本地完成，无需担心文件上传云端，充分保护您的阅读隐私。",
      icon: "🔒"
    },
    {
      title: "跨平台支持",
      description: "完美支持 Kindle、iPad、手机等各类阅读设备，随时随地享受阅读。",
      icon: "📱"
    }
  ];

  const steps = [
    {
      number: 1,
      title: "选择文件",
      description: "拖拽或点击上传您需要转换的电子书文件，支持批量选择"
    },
    {
      number: 2,
      title: "选择格式",
      description: "选择您需要的目标格式，支持 EPUB、MOBI、AZW3 等主流格式"
    },
    {
      number: 3,
      title: "开始转换",
      description: "点击转换按钮，即可获得完美转换的电子书文件"
    }
  ];

  return (
    <>
      {/* 功能特点 */}
      <div id="features" className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            强大的功能特点
          </h2>
          <div className="grid grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="p-6 border rounded-xl hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <span className="text-2xl">{feature.icon}</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 使用指南 */}
      <div id="guide" className="py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            简单三步，开始转换
          </h2>
          <div className="grid grid-cols-3 gap-8">
            {steps.map((step) => (
              <div key={step.number} className="text-center">
                <div className="w-16 h-16 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 关于我们 */}
      <div id="about" className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            关于 George Convert
          </h2>
          <div className="prose prose-lg mx-auto">
            <p className="text-gray-600 text-center mb-8">
              George Convert 诞生于对更好的电子书阅读体验的追求。
              作为一个免费开源的电子书格式转换工具，我们致力于为读者提供最简单、最高效的解决方案。
            </p>
            <div className="grid grid-cols-2 gap-8 mt-12">
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-4">开源承诺</h3>
                <p className="text-gray-600">
                  我们坚信开源的力量。项目完全开源，欢迎访问我们的 
                  <a 
                    href="https://github.com/aproof-go/george-convert" 
                    className="text-blue-500 hover:text-blue-600 ml-1"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    GitHub 仓库
                  </a>
                  ，一起让这个工具变得更好。
                </p>
              </div>
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-4">参与贡献</h3>
                <p className="text-gray-600">
                  无论是提交 Issue、Pull Request，还是提供建议，
                  我们都非常欢迎您的参与。让我们一起打造更好的电子书转换工具。
                </p>
              </div>
            </div>
            
            {/* 添加 GitHub 统计 */}
            <div className="flex justify-center gap-4 mt-8">
              <a 
                href="https://github.com/aproof-go/george-convert/stargazers"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 .25a.75.75 0 0 1 .673.418l3.058 6.197 6.839.994a.75.75 0 0 1 .415 1.279l-4.948 4.823 1.168 6.811a.75.75 0 0 1-1.088.791L12 18.347l-6.117 3.216a.75.75 0 0 1-1.088-.79l1.168-6.812-4.948-4.823a.75.75 0 0 1 .416-1.28l6.838-.993L11.328.668A.75.75 0 0 1 12 .25z"/>
                </svg>
                <span>Star</span>
              </a>
              <a 
                href="https://github.com/aproof-go/george-convert/fork"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.75 19.25a3.25 3.25 0 1 1 6.5 0 3.25 3.25 0 0 1-6.5 0ZM5 3.25a3.25 3.25 0 1 1 6.5 0 3.25 3.25 0 0 1-6.5 0ZM15.25 3.25a3.25 3.25 0 1 1 6.5 0 3.25 3.25 0 0 1-6.5 0Z"/>
                </svg>
                <span>Fork</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ContentSections;
