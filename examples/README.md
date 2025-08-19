# Smart Task Pipeline Examples

This directory contains real-world examples demonstrating both **decision** and **execution** modes of the Smart Task Azure DevOps extension. These examples are perfect for hackathon demonstrations and showcase the AI's ability to analyze, decide, and execute complex DevOps workflows.

## 🎯 Example Categories

### Decision Mode Examples
These examples show how AI can analyze context and make intelligent decisions for your pipelines:

- **[decision-intelligent-testing.yml](./decision-intelligent-testing.yml)** - AI analyzes code changes and decides which tests to run
- **[decision-security-strategy.yml](./decision-security-strategy.yml)** - AI determines appropriate security scanning strategy based on project analysis

### Execution Mode Examples  
These examples demonstrate AI executing complex tasks and automations:

- **[execution-smart-deployment.yml](./execution-smart-deployment.yml)** - AI-driven deployment with environment detection and health checks
- **[execution-repository-automation.yml](./execution-repository-automation.yml)** - Automated repository maintenance and issue resolution

### Hackathon Demo
- **[hackathon-demo.yml](./hackathon-demo.yml)** - Quick, comprehensive demo showcasing both modes in an easy-to-understand format

## 🚀 Quick Start for Hackathons

### 1. **Best Demo Pipeline**: `hackathon-demo.yml`
Perfect for live demonstrations - shows both decision and execution modes in under 5 minutes.

**What it demonstrates:**
- 🧠 **AI Decision Making**: Analyzes your project and makes intelligent recommendations
- ⚡ **AI Task Execution**: Executes complex tasks based on the analysis
- 📊 **Visual Results**: Clear, emoji-rich output perfect for presentations
- 🎯 **Real Intelligence**: Actually reads your code and makes contextual decisions

### 2. **Real-World Impact**: `decision-intelligent-testing.yml`
Shows immediate ROI - AI determines which tests to run based on actual code changes.

**Business Value:**
- ⏰ **Saves Time**: Only runs necessary tests, reducing pipeline duration
- 💰 **Reduces Costs**: Less compute time = lower Azure DevOps costs
- 🎯 **Improves Quality**: Smarter testing strategy based on actual risk assessment
- 🧠 **Self-Optimizing**: Learns from your project structure and branch patterns

### 3. **Enterprise Security**: `decision-security-strategy.yml`
Perfect for enterprise demos - shows AI making security decisions based on actual code analysis.

**Enterprise Features:**
- 🔒 **Dynamic Security**: Security scanning strategy adapts to your code
- 📋 **Compliance**: Automated license and vulnerability checking
- 🎯 **Risk-Based**: Prioritizes security efforts where they matter most
- 📊 **Auditable**: Full reasoning and decision logs for compliance

## 📋 Setup Instructions

### 1. Prerequisites
```yaml
# Set these as pipeline variables (keep AZURE_OPENAI_KEY as secret):
MODEL_TYPE: 'AZURE_OPENAI'                                    # Model provider type
AZURE_OPENAI_INSTANCE_NAME: 'your-azure-openai-instance'     # Your Azure OpenAI instance name
AZURE_OPENAI_KEY: '$(AZURE_OPENAI_API_KEY)'                  # Secret variable for API key
AZURE_OPENAI_DEPLOYMENT_NAME: 'gpt-4o'                       # Your model deployment name
AZURE_OPENAI_API_VERSION: '2024-02-15-preview'               # Azure OpenAI API version
```

### 2. Install the Extension
1. Install the Smart Task extension from Azure DevOps Marketplace
2. Configure your Azure OpenAI credentials
3. Copy any example pipeline to your repository
4. Customize the prompts for your specific use case

### 3. Run Your First Demo
```bash
# Use the hackathon demo for your first run:
cp examples/hackathon-demo.yml azure-pipelines.yml

# Commit and push to trigger the pipeline
git add azure-pipelines.yml
git commit -m "Add AI-powered pipeline demo"
git push
```

## 🎭 Demo Scenarios by Audience

### For **Developers**
Use `decision-intelligent-testing.yml`:
- "Look how AI analyzes our code changes and only runs the tests that matter"
- "No more waiting for full test suites on every feature branch"
- "The AI actually reads our package.json and understands our project structure"

### For **DevOps Engineers** 
Use `execution-smart-deployment.yml`:
- "AI handles complex deployment logic automatically"
- "Environment detection based on branch names and build context"
- "Automatic health checks and rollback procedures"

### For **Security Teams**
Use `decision-security-strategy.yml`:
- "Security scanning strategy adapts to what's actually in our code"
- "No more one-size-fits-all security pipelines"
- "Prioritizes security efforts based on actual risk assessment"

### For **Management/Business**
Use `hackathon-demo.yml`:
- "AI that actually understands our code and makes intelligent decisions"
- "Reduces pipeline time by 50-70% through smart test selection"
- "Self-optimizing DevOps that gets better over time"

## 🔧 Customization Guide

### Modifying Prompts
Each example contains detailed prompts that you can customize:

```yaml
prompt: |
  Your custom instructions here...
  
  1. **Analysis Phase:**
     - What specific analysis do you want?
     
  2. **Decision/Execution Phase:**
     - What decisions or actions should the AI take?
     
  3. **Output Requirements:**
     - What variables should be set?
     - What files should be created?
```

### Adding Your Context
Customize the `additionalContext` section for your specific environment:

```yaml
additionalContext: |
  {
    "your_project_context": {
      "technology": "your_stack",
      "environments": ["dev", "staging", "prod"],
      "specific_requirements": "your_needs"
    }
  }
```

## 📊 Expected Results

### Decision Mode Outputs
- **Pipeline Variables**: Set based on AI analysis
- **Reasoning Logs**: Clear explanation of decisions made
- **Conditional Steps**: Subsequent pipeline steps execute based on AI decisions

### Execution Mode Outputs
- **Automated Tasks**: Commands executed based on AI reasoning
- **File Operations**: Files created, modified, or analyzed
- **System Integration**: Integration with external tools and services
- **Detailed Logs**: Professional, enterprise-ready logging

## 🏆 Hackathon Tips

### 1. **Start Simple**
Begin with `hackathon-demo.yml` - it's designed to work out of the box and showcase all capabilities.

### 2. **Customize for Your Audience**
- **Technical audience**: Focus on the actual AI reasoning and decision-making
- **Business audience**: Emphasize time savings and cost reduction
- **Security audience**: Highlight compliance and risk-based decision making

### 3. **Show Real Intelligence**
- Let the AI analyze YOUR actual project - don't use fake data
- Show how decisions change based on different branch names or contexts
- Demonstrate the AI's reasoning through the professional logs

### 4. **Highlight Business Value**
- "Reduces pipeline time by 50-70%"
- "Eliminates manual DevOps configuration"
- "Self-optimizing based on your actual codebase"
- "Scales DevOps expertise across your entire organization"

## 🤝 Contributing

Have a great example pipeline? Submit a PR with:
- A new example YAML file
- Clear description of the use case
- Documentation of the business value
- Instructions for customization

## 📞 Support

- Check the main README for detailed setup instructions
- Review the tool documentation for available capabilities
- Open issues for specific pipeline examples you'd like to see

---

**Ready to revolutionize your DevOps with AI?** Start with `hackathon-demo.yml` and watch your audience's reaction! 🚀
