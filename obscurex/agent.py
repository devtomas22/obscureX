#!/usr/bin/env python3
"""
AI Agent for Binance Cryptocurrency Analysis and ML Pipeline Management
Now with modular tools supporting Binance price data analysis
"""

import json
import os
import sys
import asyncio
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, List, Optional
from secrets import token_hex

from .services.ai_service import AIService
from .tools.tool_loader import load_tools, get_tool


class ObscureXAgent:
    """Main AI Agent class for ObscureX."""
    
    def __init__(
        self, 
        api_key: Optional[str] = None,
        memory_path: str = './agent_memory.json',
        long_term_memory_path: str = './agent_longterm_memory.json'
    ):
        """
        Initialize the ObscureX Agent.
        
        Args:
            api_key: Google API key for Gemini (optional, will check env vars)
            memory_path: Path to short-term memory file
            long_term_memory_path: Path to long-term memory file
        """
        # Initialize AI Service
        self.ai_service = AIService(api_key)
        
        # Memory management
        self.memory_path = memory_path
        self.long_term_memory_path = long_term_memory_path
        self.memory = self._load_memory(memory_path)
        self.long_term_memory = self._load_memory(long_term_memory_path)
        
        # Session tracking
        timestamp = int(datetime.now().timestamp() * 1000)
        random_hex = token_hex(4)
        self.session_id = f"session_{timestamp}_{random_hex}"
        
        # Tools will be loaded dynamically
        self.tools: List[Dict[str, Any]] = []
        self._tools_loaded = False
    
    async def _ensure_tools_loaded(self):
        """Load tools dynamically from the tools directory."""
        if not self._tools_loaded:
            self.tools = await load_tools()
            self._tools_loaded = True
    
    def _load_memory(self, path: str) -> Dict[str, Any]:
        """
        Load memory from JSON file.
        
        Args:
            path: Path to memory file
            
        Returns:
            Memory dictionary
        """
        try:
            if os.path.exists(path):
                with open(path, 'r', encoding='utf-8') as f:
                    return json.load(f)
        except Exception as e:
            print(f"Warning: Failed to load memory from {path}: {e}")
        
        return {
            'entries': [],
            'metadata': {'created': datetime.now().isoformat()}
        }
    
    def _save_memory(self, path: str, memory: Dict[str, Any]):
        """
        Save memory to JSON file.
        
        Args:
            path: Path to memory file
            memory: Memory dictionary to save
        """
        try:
            memory['metadata']['lastUpdated'] = datetime.now().isoformat()
            with open(path, 'w', encoding='utf-8') as f:
                json.dump(memory, f, indent=2, ensure_ascii=False)
        except Exception as e:
            print(f"Error: Failed to save memory to {path}: {e}")
    
    async def execute_tool(self, tool_name: str, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute a tool by name with given parameters.
        
        Args:
            tool_name: Name of the tool to execute
            params: Parameters for the tool
            
        Returns:
            Result dictionary with success status and result/error
        """
        await self._ensure_tools_loaded()
        
        tool = get_tool(self.tools, tool_name)
        
        if not tool:
            raise Exception(f"Tool '{tool_name}' not found")
        
        try:
            # Create context for tool execution
            context = {
                'memory': self.memory,
                'longTermMemory': self.long_term_memory,
                'sessionId': self.session_id,
                'saveMemory': self._save_memory,
                'memoryPath': self.memory_path,
                'longTermMemoryPath': self.long_term_memory_path,
                'aiService': self.ai_service
            }
            
            # For tools that need AI, pass aiService in params
            ai_required_tools = [
                'generateMLPipeline',
                'analyzeContext',
                'getExecutionOptions',
                'recommendOptimizationStrategy',
                'executeAutonomousDecision'
            ]
            
            if tool_name in ai_required_tools:
                params = {**params, 'aiService': self.ai_service}
            
            # Execute the tool
            execute_func = tool['execute']
            if asyncio.iscoroutinefunction(execute_func):
                result = await execute_func(params, context)
            else:
                result = execute_func(params, context)
            
            return {
                'success': True,
                'tool': tool_name,
                'result': result
            }
        except Exception as error:
            return {
                'success': False,
                'tool': tool_name,
                'error': str(error)
            }
    
    async def list_tools(self) -> List[Dict[str, Any]]:
        """
        List all available tools.
        
        Returns:
            List of tool metadata dictionaries
        """
        await self._ensure_tools_loaded()
        
        return [
            {
                'name': t.get('name'),
                'description': t.get('description'),
                'parameters': t.get('parameters'),
                'category': t.get('category')
            }
            for t in self.tools
        ]
    
    async def run_optimization_loop(self, config: Dict[str, Any]) -> Dict[str, Any]:
        """
        Orchestrator: Continuously optimize ML pipeline until MSE threshold is met.
        
        Args:
            config: Configuration dictionary with dataFile, mseThreshold, etc.
            
        Returns:
            Results dictionary
        """
        data_file = config.get('dataFile')
        initial_prompt = config.get('initialPrompt', 
                                    'Create a price prediction pipeline for Binance data using CatBoost')
        mse_threshold = config.get('mseThreshold', 0.1)
        max_iterations = config.get('maxIterations', 50)
        verbose = config.get('verbose', True)
        
        if verbose:
            print('=== Starting Optimization Orchestrator ===')
            print(f'MSE Threshold: {mse_threshold}')
            print(f'Max Iterations: {max_iterations}')
            print(f'Session ID: {self.session_id}\n')
        
        # Initialize orchestrator state in memory
        await self.execute_tool('storeMemory', {
            'key': 'orchestrator_config',
            'value': config,
            'metadata': {'type': 'config'}
        })
        
        # Load previous best from long-term memory if available
        best_result = await self.execute_tool('retrieveLongTermMemory', {
            'key': 'best_pipeline'
        })
        
        best_mse = best_result.get('result', {}).get('value', {}).get('mse', float('inf'))
        best_code = best_result.get('result', {}).get('value', {}).get('code')
        
        if verbose and best_code:
            print(f'Loaded previous best MSE: {best_mse}\n')
        
        current_code = best_code
        iteration = 0
        
        while iteration < max_iterations:
            iteration += 1
            
            if verbose:
                print(f'--- Iteration {iteration} ---')
            
            # Generate or optimize ML pipeline
            if current_code:
                prompt = f'Optimize this pipeline to improve MSE. Current MSE: {best_mse}'
                gen_result = await self.execute_tool('generateMLPipeline', {
                    'existingCode': current_code,
                    'prompt': prompt
                })
            else:
                gen_result = await self.execute_tool('generateMLPipeline', {
                    'existingCode': None,
                    'prompt': initial_prompt
                })
            
            if not gen_result.get('success'):
                if verbose:
                    print(f"Error generating pipeline: {gen_result.get('error')}")
                continue
            
            # Test the pipeline
            test_result = await self.execute_tool('testMLPipeline', {
                'pythonCode': gen_result['result'].get('code', '')
            })
            
            if not test_result.get('success'):
                if verbose:
                    print(f"Error testing pipeline: {test_result.get('error')}")
                continue
            
            current_mse = test_result['result'].get('mse', float('inf'))
            
            if verbose:
                print(f'MSE: {current_mse}')
            
            # Update best if improved
            if current_mse < best_mse:
                best_mse = current_mse
                current_code = gen_result['result'].get('code', '')
                
                # Store in long-term memory
                await self.execute_tool('storeLongTermMemory', {
                    'key': 'best_pipeline',
                    'value': {'mse': best_mse, 'code': current_code},
                    'metadata': {'iteration': iteration}
                })
                
                if verbose:
                    print(f'✓ New best MSE: {best_mse}')
            
            # Check if threshold is met
            if best_mse <= mse_threshold:
                if verbose:
                    print(f'\n✓ Threshold met! Best MSE: {best_mse}')
                break
        
        return {
            'bestMSE': best_mse,
            'iterations': iteration,
            'thresholdMet': best_mse <= mse_threshold
        }


def main():
    """Main entry point for CLI usage."""
    import argparse
    
    parser = argparse.ArgumentParser(description='ObscureX AI Agent')
    parser.add_argument('command', nargs='?', default='list-tools',
                       help='Command to run (list-tools, optimize)')
    parser.add_argument('--data-file', help='Data file for optimization')
    parser.add_argument('--threshold', type=float, default=0.1,
                       help='MSE threshold for optimization')
    parser.add_argument('--max-iterations', type=int, default=50,
                       help='Maximum iterations for optimization')
    
    args = parser.parse_args()
    
    # Create agent
    agent = ObscureXAgent()
    
    # Run command
    if args.command == 'list-tools':
        tools = asyncio.run(agent.list_tools())
        print(json.dumps(tools, indent=2))
    elif args.command == 'optimize':
        config = {
            'dataFile': args.data_file,
            'mseThreshold': args.threshold,
            'maxIterations': args.max_iterations,
            'verbose': True
        }
        result = asyncio.run(agent.run_optimization_loop(config))
        print(f"\nOptimization complete:")
        print(f"Best MSE: {result['bestMSE']}")
        print(f"Iterations: {result['iterations']}")
    else:
        print(f"Unknown command: {args.command}")
        sys.exit(1)


if __name__ == '__main__':
    main()
