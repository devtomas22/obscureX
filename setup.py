from setuptools import setup, find_packages

with open("README.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

setup(
    name="obscurex-agent",
    version="3.0.0",
    author="",
    description="Autonomous AI agent with self-directed decision-making, Binance integration, modular tools, memory management, and ML pipeline optimization",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/devtomas22/obscureX",
    packages=find_packages(),
    classifiers=[
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: ISC License",
        "Operating System :: OS Independent",
    ],
    python_requires=">=3.8",
    install_requires=[
        "anthropic>=0.72.0",
        "requests>=2.31.0",
        "pandas>=2.0.0",
        "numpy>=1.24.0",
    ],
    entry_points={
        "console_scripts": [
            "obscurex=obscurex.agent:main",
        ],
    },
)
