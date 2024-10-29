'use client'

import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import { useState } from "react";

export const client = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});
const createGetResponse = (propmpt: ChatCompletionMessageParam[]) => async (): Promise<any> => {
  if (!propmpt.length) return [{}]
  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: propmpt,
    response_format: {"type": "json_object"}
  })
  .asResponse()
  const json = await response.json()
  const content = json.choices.at(0)?.message.content
  // const parsed = content ? JSON.parse(content) : {}
  return content
}
const createPrompt = ({
  promptBody,
  schemaJson,
  userInput,
}: {promptBody: string, schemaJson: string, userInput: string}): ChatCompletionMessageParam[] => {
  return   [
    {"role": "system", "content": `Extract information from message according this JSON schema - ${schemaJson}.
    ${promptBody}
  `},
  {"role": "user", "content": userInput }
  ]
}
export default function Home() {
  const [input, setInput] = useState('')
  const [schema, setSchema] = useState('')
  const [prompt, setPrompt] = useState('')
  const [output, setOutput] = useState('')
  return (
    <div className="grid items-start p-8 pb-20 gap-4 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <div className="grid w-full gap-1.5">
        <Label>Input</Label>
        <Textarea value={input} onChange={(e) => setInput(e.target.value)} id="input" />      
      </div>
      <div className="grid w-full gap-1.5">
        <Label>JSON Schema</Label>
        <Textarea value={schema} onChange={(e) => setSchema(e.target.value)} id="json" />      
      </div>
      <div className="grid w-full gap-1.5">
        <Label>Prompt</Label>
        <Textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} id="prompt" /> 
      </div>
      <Button onClick={async () => {
        const constructedPrompt = createPrompt({ promptBody: prompt, schemaJson: schema, userInput: input})
        const getResponse = createGetResponse(constructedPrompt)
        const response = await getResponse()
        setOutput(response)
      }}>Generate Output</Button>  
      <label>Output</label>
      <p>
        {output || 'No output yet'}
      </p>
    </div>
  );
}
