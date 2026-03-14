import { Sandbox } from "@vercel/sandbox";

/**
 * Executes a command in an isolated Vercel Sandbox.
 * This is used for safely running dynamic underwriting rules or code.
 */
export async function runInSandbox(code: string): Promise<string> {
  console.log('🚀 Creating Vercel Sandbox...');
  const sandbox = await Sandbox.create();
  
  try {
    // Write code to a file in the sandbox
    await sandbox.writeFiles([{ path: 'rule.js', content: Buffer.from(code) }]);
    
    // Execute the code using node
    const cmd = await sandbox.runCommand('node', ['rule.js']);
    const output = await cmd.stdout();
    const error = await cmd.stderr();
    
    if (error) {
      console.error('❌ Sandbox Error:', error);
    }
    
    return output;
  } catch (err) {
    console.error('❌ Sandbox Execution Failed:', err);
    throw err;
  } finally {
    console.log('🧹 Stopping Sandbox...');
    await sandbox.stop();
  }
}
